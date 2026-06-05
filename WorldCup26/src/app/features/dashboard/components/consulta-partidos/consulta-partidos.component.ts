import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConsultaPartidosService } from '../../services/consulta-partidos.service';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-consulta-partidos',
  templateUrl: './consulta-partidos.component.html',
  styleUrls: ['./consulta-partidos.component.scss']
})
export class ConsultaPartidosComponent implements OnInit, OnDestroy {

  partidos: any[] = [];
  equipos: any[] = [];
  cargando = true;

  filtroFase = '';
  filtroEstado = '';
  filtroEquipo = '';

  fasesGrupo = ['A','B','C','D','E','F','G','H','I','J','K','L'];
  fasesEliminacion = [
    'Dieciseisavos','Octavos','Cuartos de final',
    'Semifinal','Tercer puesto','Final'
  ];
  estados = ['Programado','En curso','Finalizado','Suspendido'];
  vistaActiva: 'todos' | 'finalizados' | 'proximos' = 'todos';

  // Detalle del partido
  partidoDetalle: any = null;
  estadisticasDetalle: any[] = [];
  eventosDetalle: any[] = [];
  cargandoDetalle = false;

  private destroy$ = new Subject<void>();

  constructor(
    private consultaService: ConsultaPartidosService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.consultaService.partidos$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => {
        this.partidos = data;
        this.cargando = false;
      });

    this.consultaService.equipos$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => this.equipos = data);

    this.consultaService.cargarPartidos().subscribe();
    this.consultaService.cargarEquipos().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get partidosFiltrados() {
    let lista = [...this.partidos];
    if (this.vistaActiva === 'finalizados') {
      lista = lista.filter(p => p.Estado_Juego === 'Finalizado');
    } else if (this.vistaActiva === 'proximos') {
      lista = lista.filter(p => p.Estado_Juego === 'Programado');
    }
    if (this.filtroFase) {
      lista = lista.filter(p =>
        p.Fase?.toLowerCase().includes(this.filtroFase.toLowerCase())
      );
    }
    if (this.filtroEstado) {
      lista = lista.filter(p => p.Estado_Juego === this.filtroEstado);
    }
    if (this.filtroEquipo) {
      lista = lista.filter(p =>
        p.NombreLocal?.toLowerCase().includes(this.filtroEquipo.toLowerCase()) ||
        p.NombreVisitante?.toLowerCase().includes(this.filtroEquipo.toLowerCase())
      );
    }
    return lista;
  }

  get totalFinalizados() {
    return this.partidos.filter(p => p.Estado_Juego === 'Finalizado').length;
  }

  get totalProgramados() {
    return this.partidos.filter(p => p.Estado_Juego === 'Programado').length;
  }

  get totalEnCurso() {
    return this.partidos.filter(p => p.Estado_Juego === 'En curso').length;
  }

  verDetalles(p: any) {
    this.partidoDetalle = p;
    this.estadisticasDetalle = [];
    this.eventosDetalle = [];
    this.cargandoDetalle = true;

    // Cargar estadísticas
    this.api.get<any[]>(`/cup/GetEstadisticas/${p.PartidoID}`).subscribe({
      next: (data: any[]) => this.estadisticasDetalle = data,
      error: () => {}
    });

    // Cargar eventos
    this.api.get<any[]>(`/cup/GetEventosPartido/${p.PartidoID}`).subscribe({
      next: (data: any[]) => {
        this.eventosDetalle = data;
        this.cargandoDetalle = false;
      },
      error: () => { this.cargandoDetalle = false; }
    });
  }

  cerrarDetalle() {
    this.partidoDetalle = null;
    this.estadisticasDetalle = [];
    this.eventosDetalle = [];
  }

  getLocal() {
    return this.estadisticasDetalle.find(e =>
      e.EquipoID === this.partidoDetalle?.EquipoLocalID
    );
  }

  getVisitante() {
    return this.estadisticasDetalle.find(e =>
      e.EquipoID === this.partidoDetalle?.EquipoVisitanteID
    );
  }

  getResultadoBadge(p: any): string {
    if (p.GolesLocal > p.GolesVisitante) return 'victoria-local';
    if (p.GolesLocal < p.GolesVisitante) return 'victoria-visitante';
    if (p.GolesLocal === p.GolesVisitante && p.GolesLocal !== null) return 'empate';
    return '';
  }

  getEstadoBadge(estado: string): string {
    switch(estado) {
      case 'Programado':  return 'badge-programado';
      case 'En curso':    return 'badge-en-curso';
      case 'Finalizado':  return 'badge-finalizado';
      case 'Suspendido':  return 'badge-suspendido';
      default:            return '';
    }
  }

  getFaseBadge(fase: string): string {
    if (this.fasesGrupo.some(g => fase?.includes(g))) return 'badge-grupo';
    if (fase === 'Final') return 'badge-final';
    if (fase === 'Semifinal') return 'badge-semi';
    return 'badge-elim';
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

  limpiarFiltros() {
    this.filtroFase = '';
    this.filtroEstado = '';
    this.filtroEquipo = '';
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