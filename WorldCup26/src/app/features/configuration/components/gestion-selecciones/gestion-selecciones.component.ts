import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EquiposService } from '../../services/equipos.service';
import { EquipoModel } from '../../../../shared/models/equipo.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gestion-selecciones',
  templateUrl: './gestion-selecciones.component.html',
  styleUrls: ['./gestion-selecciones.component.scss']
})
export class GestionSeleccionesComponent implements OnInit, OnDestroy {

  equipo: EquipoModel = { NombreEquipo: '', EscudoURL: '', Grupo: '', Estado: 'ACT' };
  listaEquipos: EquipoModel[] = [];
  equipoSeleccionado: EquipoModel | null = null;
  mostrarModal = false;
  modoEdicion = false;
  busqueda = '';
  grupos = ['A','B','C','D','E','F','G','H','I','J','K','L'];

  private destroy$ = new Subject<void>();

  constructor(
    private equiposService: EquiposService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Observer Pattern: componente se suscribe al flujo equipos$
    this.equiposService.equipos$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.listaEquipos = data);

    this.equiposService.cargarEquipos().subscribe({
      error: (err) => this.toastr.error('❌ Error al cargar equipos', err.error?.message)
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get equiposFiltrados() {
    const busq = this.busqueda.toLowerCase().trim();
    if (!busq) return this.listaEquipos;
    return this.listaEquipos.filter(e => {
      const nombre = e.NombreEquipo.toLowerCase();
      const grupo = e.Grupo.toLowerCase();
      if (busq.length === 1) return grupo === busq;
      return nombre.includes(busq) || ('grupo ' + grupo).includes(busq);
    });
  }

  onSubmit() {
    if (!this.equipo.NombreEquipo || !this.equipo.Grupo) {
      this.toastr.error('❌ Nombre y Grupo son requeridos');
      return;
    }
    const operacion = this.modoEdicion
      ? this.equiposService.actualizarEquipo(this.equipo)
      : this.equiposService.registrarEquipo(this.equipo);

    operacion.subscribe({
      next: () => {
        this.toastr.success(
          this.modoEdicion ? '✅ Equipo actualizado' : '✅ Equipo registrado', '', {
          timeOut: 5000, progressBar: true,
          progressAnimation: 'increasing', positionClass: 'toast-top-right'
        });
        this.cancelar();
      },
      error: (err) => this.toastr.error('❌ Ocurrió un error', err.error?.message)
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
    this.equiposService.eliminarEquipo(equipo.EquipoID!).subscribe({
      next: () => this.toastr.success('✅ Equipo eliminado', '', {
        timeOut: 5000, progressBar: true, positionClass: 'toast-top-right'
      }),
      error: (err) => this.toastr.error('❌ Error al eliminar', err.error?.message)
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