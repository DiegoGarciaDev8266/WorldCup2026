import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface EventoPartido {
  minuto: number;
  tipo: 'GOL' | 'TARJETA_AMARILLA' | 'TARJETA_ROJA' | 'FALTA' |
        'SUSTITUCION' | 'TIRO' | 'ATAJADA' | 'INICIO' | 'MEDIO_TIEMPO' |
        'FIN' | 'PENALTI' | 'PENALTI_GOL' | 'PENALTI_FALLADO' |
        'CORNER' | 'FUERA_DE_JUEGO';
  equipo: string;
  descripcion: string;
  esLocal: boolean;
}

export interface EstadoPartido {
  eventos: EventoPartido[];
  minuto: number;
  golesLocal: number;
  golesVisitante: number;
  simulando: boolean;
  medioTiempo: boolean;
  intervalo: any;
  minutosSimulados: number;
}

@Injectable({
  providedIn: 'root'
})
export class SimulacionService {

  private estadosSubject = new BehaviorSubject<Map<number, EstadoPartido>>(new Map());
  estados$ = this.estadosSubject.asObservable();

  private INTERVALO_MS = 3500;

  constructor(private api: ApiService) {}

  getEstado(partidoID: number): EstadoPartido {
    const estados = this.estadosSubject.getValue();
    if (!estados.has(partidoID)) {
      estados.set(partidoID, {
        eventos: [], minuto: 0,
        golesLocal: 0, golesVisitante: 0,
        simulando: false, medioTiempo: false,
        intervalo: null, minutosSimulados: 0
      });
      this.estadosSubject.next(new Map(estados));
    }
    return estados.get(partidoID)!;
  }

  estaSimulando(partidoID: number): boolean {
    return this.getEstado(partidoID).simulando;
  }

  iniciarSimulacion(partido: any) {
    const estado = this.getEstado(partido.PartidoID);
    if (estado.simulando) return;

    estado.minutosSimulados = 0;
    estado.golesLocal = partido.GolesLocal || 0;
    estado.golesVisitante = partido.GolesVisitante || 0;
    estado.eventos = [];
    estado.minuto = 0;
    estado.simulando = true;
    estado.medioTiempo = false;

    this.api.post('/cup/InicializarEstadisticas', {
      PartidoID: partido.PartidoID,
      EquipoLocalID: partido.EquipoLocalID,
      EquipoVisitanteID: partido.EquipoVisitanteID
    }).subscribe();

    this.agregarEvento(partido.PartidoID, {
      minuto: 0, tipo: 'INICIO', equipo: '',
      descripcion: `¡Comienza el partido! ${partido.NombreLocal} vs ${partido.NombreVisitante}`,
      esLocal: true
    });

    estado.intervalo = setInterval(async () => {
      await this.avanzarMinuto(partido);
    }, this.INTERVALO_MS);

    const estados = this.estadosSubject.getValue();
    estados.set(partido.PartidoID, estado);
    this.estadosSubject.next(new Map(estados));
  }

  private async avanzarMinuto(partido: any) {
    const estados = this.estadosSubject.getValue();
    const estado = estados.get(partido.PartidoID);
    if (!estado) return;

    estado.minutosSimulados++;
    estado.minuto = estado.minutosSimulados;

    if (estado.minutosSimulados === 45) {
      estado.medioTiempo = true;
      this.agregarEvento(partido.PartidoID, {
        minuto: 45, tipo: 'MEDIO_TIEMPO', equipo: '',
        descripcion: `⏱️ Fin del primer tiempo. ${estado.golesLocal} - ${estado.golesVisitante}`,
        esLocal: true
      });
      this.estadosSubject.next(new Map(estados));
      await this.esperar(3000);
      estado.medioTiempo = false;
    }

    if (estado.minutosSimulados >= 90) {
      this.finalizarSimulacion(partido, estado);
      this.estadosSubject.next(new Map(estados));
      return;
    }

    const debeGenerarEvento = estado.minutosSimulados % 3 === 0 || Math.random() < 0.3;
    if (debeGenerarEvento) {
      await this.generarEvento(partido, estado);
    }

    this.estadosSubject.next(new Map(estados));
  }

  private async generarEvento(partido: any, estado: EstadoPartido) {
    try {
      const response: any = await this.api.post<any>('/cup/GenerarEvento', {
        nombreLocal: partido.NombreLocal,
        nombreVisitante: partido.NombreVisitante,
        minuto: estado.minutosSimulados,
        golesLocal: estado.golesLocal,
        golesVisitante: estado.golesVisitante,
        fase: partido.Fase,
        partidoID: partido.PartidoID,
        equipoLocalID: partido.EquipoLocalID,
        equipoVisitanteID: partido.EquipoVisitanteID
      }).toPromise();

      if (!response || response.tipo === 'NADA') return;

      // ── PENALTI EN DOS PASOS ──
      if (response.tipo === 'PENALTI') {

        // Evento 1 — se señala el penalti
        this.agregarEvento(partido.PartidoID, {
          minuto: estado.minutosSimulados,
          tipo: 'PENALTI',
          equipo: response.equipo,
          descripcion: response.descripcionSeñalado,
          esLocal: response.esLocal
        });

        // Esperar 2 segundos antes del lanzamiento
        await this.esperar(2000);

        // Evento 2 — resultado del lanzamiento
        if (response.esGol) {
          if (response.esLocal) {
            estado.golesLocal++;
          } else {
            estado.golesVisitante++;
          }

          this.api.put('/cup/ActualizarMarcadorVivo', {
            PartidoID: partido.PartidoID,
            GolesLocal: estado.golesLocal,
            GolesVisitante: estado.golesVisitante
          }).subscribe();
        }

        this.agregarEvento(partido.PartidoID, {
          minuto: estado.minutosSimulados,
          tipo: response.resultado,
          equipo: response.equipo,
          descripcion: response.descripcionResultado,
          esLocal: response.esLocal
        });

        return;
      }

      // ── EVENTOS NORMALES ──
      if (response.tipo === 'GOL') {
        if (response.esLocal) {
          estado.golesLocal++;
        } else {
          estado.golesVisitante++;
        }

        this.api.put('/cup/ActualizarMarcadorVivo', {
          PartidoID: partido.PartidoID,
          GolesLocal: estado.golesLocal,
          GolesVisitante: estado.golesVisitante
        }).subscribe();
      }

      this.agregarEvento(partido.PartidoID, {
        minuto: estado.minutosSimulados,
        tipo: response.tipo,
        equipo: response.equipo,
        descripcion: response.descripcion,
        esLocal: response.esLocal
      });

    } catch (error) {
      console.error('Error generando evento:', error);
    }
  }

  private finalizarSimulacion(partido: any, estado: EstadoPartido) {
    clearInterval(estado.intervalo);
    estado.simulando = false;

    this.agregarEvento(partido.PartidoID, {
      minuto: 90, tipo: 'FIN', equipo: '',
      descripcion: `🏁 Fin del partido. ${partido.NombreLocal} ${estado.golesLocal} - ${estado.golesVisitante} ${partido.NombreVisitante}`,
      esLocal: true
    });

    this.api.put('/cup/FinalizarPartido', {
      PartidoID: partido.PartidoID,
      GolesLocal: estado.golesLocal,
      GolesVisitante: estado.golesVisitante
    }).subscribe();
  }

  private agregarEvento(partidoID: number, evento: EventoPartido) {
    const estados = this.estadosSubject.getValue();
    const estado = estados.get(partidoID);
    if (!estado) return;
    estado.eventos = [evento, ...estado.eventos];
    this.estadosSubject.next(new Map(estados));
  }

  resetearPartido(partidoID: number) {
    const estados = this.estadosSubject.getValue();
    const estado = estados.get(partidoID);
    if (estado?.intervalo) clearInterval(estado.intervalo);
    estados.delete(partidoID);
    this.estadosSubject.next(new Map(estados));
  }

  resetear() {
    const estados = this.estadosSubject.getValue();
    estados.forEach(estado => {
      if (estado.intervalo) clearInterval(estado.intervalo);
    });
    this.estadosSubject.next(new Map());
  }

  private esperar(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}