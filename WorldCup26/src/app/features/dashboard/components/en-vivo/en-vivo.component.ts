import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';
import { SimulacionService, EventoPartido, EstadoPartido } from '../../services/simulacion.service';

@Component({
  selector: 'app-en-vivo',
  templateUrl: './en-vivo.component.html',
  styleUrls: ['./en-vivo.component.scss']
})
export class EnVivoComponent implements OnInit, OnDestroy {

  partidosEnVivo: any[] = [];
  proximosPartidos: any[] = [];
  partidoActivo: any = null;
  cargando = true;
  tabActiva: 'vivo' | 'proximos' = 'vivo';

  // Estado del partido activo
  eventos: EventoPartido[] = [];
  minutoActual = 0;
  golesLocal = 0;
  golesVisitante = 0;
  simulando = false;
  medioTiempo = false;

  cuentasRegresivas: any = {};

  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    public simulacionService: SimulacionService
  ) {}

  ngOnInit(): void {
    this.cargarPartidosEnVivo();
    this.cargarProximosPartidos();

    // Suscribirse a cambios de estado de todos los partidos
    this.simulacionService.estados$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.partidoActivo) {
          this.actualizarEstadoActivo();
        }
      });

    interval(10000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cargarPartidosEnVivo());

    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.actualizarCuentasRegresivas());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // NO resetear al destruir — el servicio Singleton mantiene el estado
  }

  actualizarEstadoActivo() {
    if (!this.partidoActivo) return;
    const estado = this.simulacionService.getEstado(this.partidoActivo.PartidoID);
    this.eventos = estado.eventos;
    this.minutoActual = estado.minuto;
    this.golesLocal = estado.golesLocal;
    this.golesVisitante = estado.golesVisitante;
    this.simulando = estado.simulando;
    this.medioTiempo = estado.medioTiempo;
  }

  cargarPartidosEnVivo() {
    this.api.get<any[]>('/cup/GetPartidosEnVivo').subscribe({
      next: (data: any[]) => {
        this.partidosEnVivo = data;
        if (data.length > 0) {
          // Seleccionar primer partido si no hay activo
          if (!this.partidoActivo) {
            this.partidoActivo = data[0];
          }
          // Iniciar simulación para cada partido en vivo que no esté corriendo
          data.forEach(p => {
            if (!this.simulacionService.estaSimulando(p.PartidoID)) {
              this.simulacionService.iniciarSimulacion(p);
            }
          });
          this.actualizarEstadoActivo();
          this.tabActiva = 'vivo';
        }
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  cargarProximosPartidos() {
    this.api.get<any[]>('/cup/GetPartidos').subscribe({
      next: (data: any[]) => {
        this.proximosPartidos = data
          .filter(p => p.Estado_Juego === 'Programado')
          .sort((a, b) =>
            new Date(a.FechaPartido).getTime() - new Date(b.FechaPartido).getTime()
          )
          .slice(0, 5);
        this.actualizarCuentasRegresivas();
      },
      error: () => {}
    });
  }

  actualizarCuentasRegresivas() {
    const ahora = new Date().getTime();
    this.proximosPartidos.forEach(p => {
      const diff = new Date(p.FechaPartido).getTime() - ahora;
      if (diff <= 0) {
        this.cuentasRegresivas[p.PartidoID] = null;
        return;
      }
      this.cuentasRegresivas[p.PartidoID] = {
        dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
        horas: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutos: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        segundos: Math.floor((diff % (1000 * 60)) / 1000)
      };
    });
  }

  seleccionarPartido(p: any) {
    // Solo cambiar partido activo — NO resetear
    this.partidoActivo = p;
    this.actualizarEstadoActivo();
  }

  get porcentajePartido(): number {
    return Math.min((this.minutoActual / 90) * 100, 100);
  }

  getIconoEvento(tipo: string): string {
    const iconos: any = {
      'GOL':             '⚽',
      'PENALTI':         '🥅',
      'TARJETA_AMARILLA':'🟨',
      'TARJETA_ROJA':    '🟥',
      'FALTA':           '⚠️',
      'SUSTITUCION':     '🔄',
      'TIRO':            '👟',
      'ATAJADA':         '🧤',
      'CORNER':          '🚩',
      'FUERA_DE_JUEGO':  '🏴',
      'INICIO':          '🏁',
      'MEDIO_TIEMPO':    '⏱️',
      'FIN':             '🏆'
    };
    return iconos[tipo] || '📋';
  }

  getClaseEvento(tipo: string): string {
    const clases: any = {
      'GOL':             'evento-gol',
      'PENALTI':         'evento-gol',
      'TARJETA_AMARILLA':'evento-amarilla',
      'TARJETA_ROJA':    'evento-roja',
      'MEDIO_TIEMPO':    'evento-tiempo',
      'FIN':             'evento-fin',
      'INICIO':          'evento-inicio',
    };
    return clases[tipo] || 'evento-normal';
  }
}