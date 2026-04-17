import { Component, OnInit } from '@angular/core';
import { ConexionDBService } from '../../shared/conexion-db.service';
import { PartidoModel } from '../../shared/partido.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-programacion-calendario',
  templateUrl: './programacion-calendario.component.html',
  styleUrls: ['./programacion-calendario.component.scss']
})
export class ProgramacionCalendarioComponent implements OnInit {

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

  constructor(
    private conexionService: ConexionDBService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarPartidos();
    this.cargarEquipos();
  }

  partidoVacio(): PartidoModel {
    return {
      EquipoLocalID: 0,
      EquipoVisitanteID: 0,
      FechaPartido: '',
      Estadio: '',
      Fase: '',
      Estado_Juego: 'Programado'
    };
  }

  cargarPartidos() {
    this.conexionService.GetPartidos().subscribe({
      next: (data) => { this.listaPartidos = data; },
      error: (err) => { this.toastr.error('❌ Error al cargar partidos', err.error?.message); }
    });
  }

  cargarEquipos() {
    this.conexionService.GetEquiposLista().subscribe({
      next: (data) => { this.listaEquipos = data; },
      error: () => {} // silencioso si aún no hay equipos
    });
  }

  get partidosFiltrados() {
    if (!this.filtroFase) return this.listaPartidos;
    return this.listaPartidos.filter(p =>
      p.Fase?.toLowerCase().includes(this.filtroFase.toLowerCase())
    );
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

    const operacion = this.modoEdicion
      ? this.conexionService.ActualizarPartido(this.partido)
      : this.conexionService.RegistrarPartido(this.partido);

    operacion.subscribe({
      next: () => {
        this.toastr.success(
          this.modoEdicion ? '✅ Partido actualizado' : '✅ Partido registrado', '', {
          timeOut: 5000, progressBar: true,
          progressAnimation: 'increasing', positionClass: 'toast-top-right'
        });
        this.cancelar();
        this.cargarPartidos();
      },
      error: (err) => { this.toastr.error('❌ Ocurrió un error', err.error?.message); }
    });
  }

  verPartido(p: any) { this.partidoVer = { ...p }; }

  editarPartido(p: any) {
    this.modoEdicion = true;
    this.partido = { ...p };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminarPartido(p: any) {
    if (!confirm(`¿Eliminar el partido ID ${p.PartidoID}?`)) return;
    this.conexionService.EliminarPartido(p.PartidoID).subscribe({
      next: () => {
        this.toastr.success('✅ Partido eliminado', '', {
          timeOut: 5000, progressBar: true, positionClass: 'toast-top-right'
        });
        this.cargarPartidos();
      },
      error: (err) => { this.toastr.error('❌ Error al eliminar', err.error?.message); }
    });
  }

  cancelar() {
    this.modoEdicion = false;
    this.partido = this.partidoVacio();
  }

  getNombreEquipo(id: number): string {
    const eq = this.listaEquipos.find(e => e.EquipoID === id);
    return eq ? eq.NombreEquipo : `Equipo ${id}`;
  }

  getFaseBadgeColor(fase: string): string {
    if (this.fasesGrupo.includes(fase)) return 'bg-primary';
    if (fase === 'Final') return 'bg-danger';
    if (fase === 'Semifinal') return 'bg-warning text-dark';
    return 'bg-info text-dark';
  }

  getEstadoBadge(estado: string): string {
    switch(estado) {
      case 'Programado': return 'bg-secondary';
      case 'En curso': return 'bg-success';
      case 'Finalizado': return 'bg-dark';
      case 'Suspendido': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}