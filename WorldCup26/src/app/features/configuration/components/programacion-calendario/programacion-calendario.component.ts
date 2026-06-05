import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PartidosService } from '../../services/partidos.service';
import { EquiposService } from '../../services/equipos.service';
import { ResultadosService } from '../../services/resultados.service';
import { ApiService } from '../../../../core/services/api.service';
import { PartidoModel } from '@app/shared/models/partido.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-programacion-calendario',
  templateUrl: './programacion-calendario.component.html',
  styleUrls: ['./programacion-calendario.component.scss']
})
export class ProgramacionCalendarioComponent implements OnInit, OnDestroy {

  vistaActiva: 'partidos' | 'resultados' = 'partidos';

  partido: PartidoModel = this.partidoVacio();
  listaPartidos: any[] = [];
  listaEquipos: any[] = [];
  partidoVer: any = null;
  modoEdicion = false;
  filtroFase = '';

  fasesGrupo = ['A','B','C','D','E','F','G','H','I','J','K','L'];
  fasesEliminacion = [
    'Dieciseisavos','Octavos','Cuartos de final',
    'Semifinal','Tercer puesto','Final'
  ];
  estadosJuego = ['Programado','En curso','Finalizado','Suspendido'];

  listaPartidosFinalizados: any[] = [];
  partidoSeleccionado: any = null;
  golesLocal = 0;
  golesVisitante = 0;

  // ==== NUEVAS PROPIEDADES AGREGADAS PARA REPARAR EL ERROR ====
  penalesLocal = 0;
  penalesVisitante = 0;
  esFaseEliminatoria = false;
  hayEmpate = false;
  // ============================================================

  partidoEstadisticas: any = null;
  estadisticasDetalle: any[] = [];
  eventosDetalle: any[] = [];
  cargandoDetalle = false;

  partidoAEliminar: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private partidosService: PartidosService,
    private equiposService: EquiposService,
    private resultadosService: ResultadosService,
    private api: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.partidosService.partidos$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => this.listaPartidos = data);

    this.equiposService.equipos$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => this.listaEquipos = data);

    this.resultadosService.partidosFinalizados$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => this.listaPartidosFinalizados = data);

    this.partidosService.cargarPartidos().subscribe({
      error: (err: any) => this.toastr.error('❌ Error al cargar partidos', err.error?.message)
    });
    this.equiposService.cargarEquipos().subscribe();
    this.resultadosService.cargarPartidosFinalizados().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  partidoVacio(): PartidoModel {
    return {
      EquipoLocalID: 0, EquipoVisitanteID: 0,
      FechaPartido: '', Estadio: '', Fase: '', Estado_Juego: 'Programado'
    };
  }

  get partidosFiltrados() {
    if (!this.filtroFase) return this.listaPartidos;
    return this.listaPartidos.filter((p: any) =>
      p.Fase?.toLowerCase().includes(this.filtroFase.toLowerCase())
    );
  }

  // Convierte fecha del input datetime-local a formato SQL sin conversión UTC
  private formatearFecha(fechaLocal: string): string {
    if (!fechaLocal) return '';
    return fechaLocal.replace('T', ' ') + ':00';
  }

  // Muestra la fecha tal como viene del servidor sin conversión de zona horaria
  formatearFechaDisplay(fecha: any): string {
    if (!fecha) return '—';
    const str = typeof fecha === 'string' ? fecha : fecha.toString();
    const limpia = str.replace('T', ' ').replace('Z', '').split('.')[0];
    const partes = limpia.split(' ');
    if (partes.length < 2) return str;
    const [anio, mes, dia] = partes[0].split('-');
    const [hora, minuto] = partes[1].split(':');
    return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
  }

  onSubmit() {
    if (!this.partido.EquipoLocalID || !this.partido.EquipoVisitanteID ||
        !this.partido.FechaPartido || !this.partido.Fase) {
      this.toastr.error('❌ Completa todos los campos requeridos');
      return;
    }
    if (this.partido.EquipoLocalID === this.partido.EquipoVisitanteID) {
      this.toastr.error('❌ El equipo local y visitante no pueden ser el mismo');
      return;
    }

    const partidoAEnviar = {
      ...this.partido,
      FechaPartido: this.formatearFecha(this.partido.FechaPartido)
    };

    const operacion = this.modoEdicion
      ? this.partidosService.actualizarPartido(partidoAEnviar)
      : this.partidosService.registrarPartido(partidoAEnviar);

    operacion.subscribe({
      next: () => {
        this.toastr.success(
          this.modoEdicion ? '✅ Partido actualizado' : '✅ Partido registrado', '', {
          timeOut: 5000, progressBar: true,
          progressAnimation: 'increasing', positionClass: 'toast-top-right'
        });
        this.cancelar();
      },
      error: (err: any) => this.toastr.error('❌ Ocurrió un error', err.error?.message)
    });
  }

  verPartido(p: any) { this.partidoVer = { ...p }; }

  editarPartido(p: any) {
    this.modoEdicion = true;

    let fechaFormateada = '';
    if (p.FechaPartido) {
      const str = typeof p.FechaPartido === 'string'
        ? p.FechaPartido
        : p.FechaPartido.toString();
      const limpia = str.replace('Z', '').split('.')[0];
      fechaFormateada = limpia.replace(' ', 'T').slice(0, 16);
    }

    this.partido = { ...p, FechaPartido: fechaFormateada };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  abrirModalEliminar(p: any) {
    this.partidoAEliminar = p;
  }

  confirmarEliminar() {
    if (!this.partidoAEliminar) return;
    this.partidosService.eliminarPartido(this.partidoAEliminar.PartidoID).subscribe({
      next: () => {
        this.toastr.success('✅ Partido eliminado', '', {
          timeOut: 5000, progressBar: true, positionClass: 'toast-top-right'
        });
        this.partidoAEliminar = null;
      },
      error: (err: any) => {
        this.toastr.error('❌ Error al eliminar', err.error?.message);
        this.partidoAEliminar = null;
      }
    });
  }

  cancelar() {
    this.modoEdicion = false;
    this.partido = this.partidoVacio();
  }

  getNombreEquipo(id: number): string {
    const eq = this.listaEquipos.find((e: any) => e.EquipoID === id);
    return eq ? eq.NombreEquipo : '—';
  }

  getFaseBadgeColor(fase: string): string {
    if (this.fasesGrupo.some(g => fase?.includes(g))) return 'bg-primary';
    if (fase === 'Final') return 'bg-danger';
    if (fase === 'Semifinal') return 'bg-warning text-dark';
    return 'bg-info text-dark';
  }

  getEstadoBadge(estado: string): string {
    switch(estado) {
      case 'Programado':  return 'bg-secondary';
      case 'En curso':    return 'bg-success';
      case 'Finalizado':  return 'bg-dark';
      case 'Suspendido':  return 'bg-danger';
      default:            return 'bg-secondary';
    }
  }

  seleccionarPartido(p: any) {
    this.partidoSeleccionado = { ...p };
    this.golesLocal = p.GolesLocal ?? 0;
    this.golesVisitante = p.GolesVisitante ?? 0;
    this.partidoEstadisticas = null;

    // Evaluamos dinámicamente si la fase seleccionada es de eliminación directa
    this.esFaseEliminatoria = this.fasesEliminacion.some(fase => 
      p.Fase?.toLowerCase().includes(fase.toLowerCase())
    );

    // Corremos la validación inicial de goles por si ya viene empatado de la BD
    this.onGolesChange();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarSeleccion() {
    this.partidoSeleccionado = null;
    this.golesLocal = 0;
    this.golesVisitante = 0;
    this.penalesLocal = 0;
    this.penalesVisitante = 0;
    this.hayEmpate = false;
    this.esFaseEliminatoria = false;
  }

  // ==== NUEVO MÉTODO AGREGADO PARA REPARAR EL ERROR ====
  onGolesChange() {
    this.hayEmpate = this.golesLocal === this.golesVisitante;
    
    // Si se rompe el empate, limpiamos los campos de penales por seguridad
    if (!this.hayEmpate) {
      this.penalesLocal = 0;
      this.penalesVisitante = 0;
    }
  }
  // ====================================================

  registrarResultado() {
    if (!this.partidoSeleccionado) return;
    if (this.golesLocal < 0 || this.golesVisitante < 0) {
      this.toastr.error('❌ Los goles no pueden ser negativos');
      return;
    }

    // Validación extra: si es eliminación y hay empate, los penales no pueden quedar iguales
    if (this.esFaseEliminatoria && this.hayEmpate && this.penalesLocal === this.penalesVisitante) {
      this.toastr.error('❌ En fase eliminatoria debe haber un ganador en los penales');
      return;
    }

    // Nota: Si tu backend requiere recibir PenalesLocal y PenalesVisitante, 
    // puedes agregarlos aquí al objeto que se envía.
    this.resultadosService.registrarResultado({
      PartidoID: this.partidoSeleccionado.PartidoID,
      GolesLocal: this.golesLocal,
      GolesVisitante: this.golesVisitante,
      Estado_Juego: 'Finalizado'
    }).subscribe({
      next: () => {
        this.toastr.success('✅ Resultado registrado correctamente', '', {
          timeOut: 5000, progressBar: true,
          progressAnimation: 'increasing', positionClass: 'toast-top-right'
        });
        this.cancelarSeleccion();
        this.resultadosService.cargarPartidosFinalizados().subscribe();
      },
      error: (err: any) => this.toastr.error('❌ Ocurrió un error', err.error?.message)
    });
  }

  verEstadisticas(p: any) {
    this.partidoEstadisticas = p;
    this.estadisticasDetalle = [];
    this.eventosDetalle = [];
    this.cargandoDetalle = true;

    this.api.get<any[]>(`/cup/GetEstadisticas/${p.PartidoID}`).subscribe({
      next: (data: any[]) => this.estadisticasDetalle = data,
      error: () => {}
    });

    this.api.get<any[]>(`/cup/GetEventosPartido/${p.PartidoID}`).subscribe({
      next: (data: any[]) => {
        this.eventosDetalle = data;
        this.cargandoDetalle = false;
      },
      error: () => { this.cargandoDetalle = false; }
    });
  }

  cerrarEstadisticas() {
    this.partidoEstadisticas = null;
    this.estadisticasDetalle = [];
    this.eventosDetalle = [];
  }

  getLocal() {
    return this.estadisticasDetalle.find(e =>
      e.EquipoID === this.partidoEstadisticas?.EquipoLocalID
    );
  }

  getVisitante() {
    return this.estadisticasDetalle.find(e =>
      e.EquipoID === this.partidoEstadisticas?.EquipoVisitanteID
    );
  }

  getResultadoBadge(p: any): string {
    if (p.GolesLocal > p.GolesVisitante) return 'victoria-local';
    if (p.GolesLocal < p.GolesVisitante) return 'victoria-visitante';
    return 'empate';
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
}