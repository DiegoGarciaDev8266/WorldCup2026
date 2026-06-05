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
<<<<<<< HEAD:WorldCup26/src/app/Configuration/gestion-roles/gestion-roles.component.ts
    this.cargarRoles();
  }

  cargarRoles() {
    this.conexionService.GetRoles().subscribe({
      next: (data) => {
=======
    // Observer Pattern: componente se suscribe al flujo roles$
    this.rolesService.roles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
>>>>>>> origin/main:WorldCup26/src/app/features/configuration/components/gestion-roles/gestion-roles.component.ts
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
<<<<<<< HEAD:WorldCup26/src/app/Configuration/gestion-roles/gestion-roles.component.ts
        this.cargarRoles();
=======
>>>>>>> origin/main:WorldCup26/src/app/features/configuration/components/gestion-roles/gestion-roles.component.ts
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
<<<<<<< HEAD:WorldCup26/src/app/Configuration/gestion-roles/gestion-roles.component.ts
    this.conexionService.InactivarUsuario(payload).subscribe({
      next: () => {
        this.toastr.success('✅ Usuario inactivado', '', {
          timeOut: 5000, progressBar: true, positionClass: 'toast-top-right'
        });
        this.cargarRoles();
      },
      error: (error) => { this.toastr.error('❌ Ocurrió un error', error.error?.message); }
=======
    this.rolesService.inactivarUsuario(payload).subscribe({
      next: () => this.toastr.success('✅ Usuario inactivado', '', {
        timeOut: 5000, progressBar: true, positionClass: 'toast-top-right'
      }),
      error: (err) => this.toastr.error('❌ Ocurrió un error', err.error?.message)
>>>>>>> origin/main:WorldCup26/src/app/features/configuration/components/gestion-roles/gestion-roles.component.ts
    });
  }
}