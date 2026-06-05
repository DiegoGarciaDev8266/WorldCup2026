import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RolesService } from '../../services/roles.service';
import { GestionRolesMoldel } from '../../../../shared/models/gestion-roles.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gestion-roles',
  templateUrl: './gestion-roles.component.html',
  styleUrls: ['./gestion-roles.component.scss']
})
export class GestionRolesComponent implements OnInit, OnDestroy {

  gestion_rol: GestionRolesMoldel = {
    NOMBRE_ROL: '', ESTADO: 'ACT', EMAIL: ''
  };

  listaUsuarios: GestionRolesMoldel[] = [];
  usuarioSeleccionado: GestionRolesMoldel | null = null;
  mostrarModal = false;
  modoEdicion = false;
  rolesDisponibles: string[] = ['usuario', 'admin'];

  private destroy$ = new Subject<void>();

  constructor(
    private rolesService: RolesService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.rolesService.roles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        console.log('datos roles:', data);
        this.listaUsuarios = data;
      });

    this.rolesService.cargarRoles().subscribe({
      error: (err) => this.toastr.error('❌ Error al cargar usuarios', err.error?.message)
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    if (!this.gestion_rol.EMAIL || !this.gestion_rol.NOMBRE_ROL) {
      this.toastr.error('❌ Completa todos los campos requeridos');
      return;
    }
    this.rolesService.actualizarRol(this.gestion_rol).subscribe({
      next: () => {
        this.toastr.success('✅ Rol actualizado correctamente', '', {
          timeOut: 5000, progressBar: true,
          progressAnimation: 'increasing', positionClass: 'toast-top-right'
        });
        this.cancelarEdicion();
      },
      error: (err) => this.toastr.error('❌ Ocurrió un error', err.error?.message)
    });
  }

  verUsuario(usuario: GestionRolesMoldel) {
    this.usuarioSeleccionado = usuario;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.usuarioSeleccionado = null;
  }

  editarUsuario(usuario: GestionRolesMoldel) {
    this.modoEdicion = true;
    this.gestion_rol = { ...usuario };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.gestion_rol = { NOMBRE_ROL: '', ESTADO: 'ACT', EMAIL: '' };
  }

  inactivarUsuario(usuario: GestionRolesMoldel) {
    const payload = { ...usuario, ESTADO: 'INA' };
    this.rolesService.inactivarUsuario(payload).subscribe({
      next: () => this.toastr.success('✅ Usuario inactivado', '', {
        timeOut: 5000, progressBar: true, positionClass: 'toast-top-right'
      }),
      error: (err) => this.toastr.error('❌ Ocurrió un error', err.error?.message)
    });
  }
}