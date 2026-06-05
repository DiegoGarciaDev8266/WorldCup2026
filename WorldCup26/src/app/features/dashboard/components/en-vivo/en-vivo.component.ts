import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';
import { SimulacionService, EventoPartido, EstadoPartido } from '../../services/simulacion.service';
import { SocketService } from '../../../../core/services/socket.service';

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
    public simulacionService: SimulacionService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.cargarPartidosEnVivo();
    this.cargarProximosPartidos();
    this.suscribirseASimulacion();
    this.suscribirseAWebSockets();

    // Polling de respaldo cada 30 segundos
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cargarPartidosEnVivo());

    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.actualizarCuentasRegresivas());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  suscribirseAWebSockets() {
    // Cuando el backend notifica que un partido inició
    this.socketService.partidoIniciado$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('⚽ Partido iniciado via WebSocket');
        this.cargarPartidosEnVivo();
      });
  }

  suscribirseASimulacion() {
    this.simulacionService.estados$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.partidoActivo) {
          this.actualizarEstadoActivo();
        }
      });
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
          if (!this.partidoActivo) {
            this.partidoActivo = data[0];
          }
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
    if (this.partidoActivo?.PartidoID === p.PartidoID) return;
    this.partidoActivo = p;
    this.actualizarEstadoActivo();
  }

  get porcentajePartido(): number {
    return Math.min((this.minutoActual / 90) * 100, 100);
  }

    getIconoEvento(tipo: string): string {
    const iconos: any = {
      'GOL':             '⚽',
      'PENALTI':         '🟡',  // señalamiento
      'PENALTI_GOL':     '⚽🥅', // convertido
      'PENALTI_FALLADO': '❌🥅', // fallado
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
      'PENALTI':         'evento-amarilla',  // señalamiento en amarillo
      'PENALTI_GOL':     'evento-gol',       // convertido en verde
      'PENALTI_FALLADO': 'evento-normal',    // fallado neutro
      'TARJETA_AMARILLA':'evento-amarilla',
      'TARJETA_ROJA':    'evento-roja',
      'MEDIO_TIEMPO':    'evento-tiempo',
      'FIN':             'evento-fin',
      'INICIO':          'evento-inicio',
    };
    return clases[tipo] || 'evento-normal';
  }
}