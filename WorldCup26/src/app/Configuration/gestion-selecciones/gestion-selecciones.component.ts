import { Component, OnInit } from '@angular/core';
import { ConexionDBService } from '../../shared/conexion-db.service';
import { EquipoModel } from '../../shared/equipo.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gestion-selecciones',
  templateUrl: './gestion-selecciones.component.html',
  styleUrls: ['./gestion-selecciones.component.scss']
})
export class GestionSeleccionesComponent implements OnInit {

  equipo: EquipoModel = { NombreEquipo: '', EscudoURL: '', Grupo: '', Estado: 'ACT' };
  listaEquipos: EquipoModel[] = [];
  equipoSeleccionado: EquipoModel | null = null;
  mostrarModal = false;
  modoEdicion = false;
  busqueda = '';

  grupos = ['A','B','C','D','E','F','G','H','I','J','K','L'];

  constructor(
    private conexionService: ConexionDBService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void { this.cargarEquipos(); }

  cargarEquipos() {
    this.conexionService.GetEquipos().subscribe({
      next: (data) => { this.listaEquipos = data; },
      error: (err) => { this.toastr.error('❌ Error al cargar equipos', err.error?.message); }
    });
  }

  get equiposFiltrados() {
    return this.listaEquipos.filter(e =>
      e.NombreEquipo.toLowerCase().includes(this.busqueda.toLowerCase()) ||
      e.Grupo.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  onSubmit() {
    if (!this.equipo.NombreEquipo || !this.equipo.Grupo) {
      this.toastr.error('❌ Nombre y Grupo son requeridos');
      return;
    }
    const operacion = this.modoEdicion
      ? this.conexionService.ActualizarEquipo(this.equipo)
      : this.conexionService.RegistrarEquipo(this.equipo);

    operacion.subscribe({
      next: () => {
        this.toastr.success(
          this.modoEdicion ? '✅ Equipo actualizado' : '✅ Equipo registrado', '', {
          timeOut: 5000, progressBar: true,
          progressAnimation: 'increasing', positionClass: 'toast-top-right'
        });
        this.cancelar();
        this.cargarEquipos();
      },
      error: (err) => { this.toastr.error('❌ Ocurrió un error', err.error?.message); }
    });
  }

  verEquipo(equipo: EquipoModel) {
    this.equipoSeleccionado = equipo;
    this.mostrarModal = true;
  }

  editarEquipo(equipo: EquipoModel) {
    this.modoEdicion = true;
    this.equipo = { ...equipo };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminarEquipo(equipo: EquipoModel) {
    if (!confirm(`¿Eliminar el equipo "${equipo.NombreEquipo}"?`)) return;
    this.conexionService.EliminarEquipo(equipo.EquipoID!).subscribe({
      next: () => {
        this.toastr.success('✅ Equipo eliminado', '', {
          timeOut: 5000, progressBar: true, positionClass: 'toast-top-right'
        });
        this.cargarEquipos();
      },
      error: (err) => { this.toastr.error('❌ Error al eliminar', err.error?.message); }
    });
  }

  cancelar() {
    this.modoEdicion = false;
    this.equipo = { NombreEquipo: '', EscudoURL: '', Grupo: '', Estado: 'ACT' };
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.equipoSeleccionado = null;
  }
}