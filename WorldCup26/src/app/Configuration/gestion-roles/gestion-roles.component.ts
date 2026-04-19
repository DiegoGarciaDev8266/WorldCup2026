import { Component, OnInit } from '@angular/core';
import { ConexionDBService } from '../../shared/conexion-db.service';
import { GestionRolesMoldel } from '../../shared/gestion-roles.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gestion-roles',
  templateUrl: './gestion-roles.component.html',
  styleUrls: ['./gestion-roles.component.scss']
})
export class GestionRolesComponent implements OnInit {

  gestion_rol: GestionRolesMoldel = {
    NOMBRE_ROL: '', DESCRIPCION: '', ESTADO: 'ACT', EMAIL: ''
  };

  listaUsuarios: GestionRolesMoldel[] = [];
  usuarioSeleccionado: GestionRolesMoldel | null = null;
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  rolesDisponibles: string[] = ['usuario', 'admin'];

  constructor(
    private conexionService: ConexionDBService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.conexionService.GetRoles().subscribe({
      next: (data) => {
        console.log('datos roles:', data);
        this.listaUsuarios = data;
      },
      error: (err) => { this.toastr.error('❌ Error al cargar usuarios', err.error?.message); }
    });
  }

  onSubmit() {
    if (!this.gestion_rol.EMAIL || !this.gestion_rol.NOMBRE_ROL) {
      this.toastr.error('❌ Completa todos los campos requeridos');
      return;
    }
    this.conexionService.ActualizarRolUsuario(this.gestion_rol).subscribe({
      next: () => {
        this.toastr.success('✅ Rol actualizado correctamente', '', {
          timeOut: 5000, progressBar: true,
          progressAnimation: 'increasing', positionClass: 'toast-top-right'
        });
        this.cancelarEdicion();
        this.cargarUsuarios();
      },
      error: (error) => { this.toastr.error('❌ Ocurrió un error', error.error?.message); }
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
    this.gestion_rol = { NOMBRE_ROL: '', DESCRIPCION: '', ESTADO: 'ACT', EMAIL: '' };
  }

  inactivarUsuario(usuario: GestionRolesMoldel) {
    const payload = { ...usuario, ESTADO: 'INA' };
    this.conexionService.InactivarUsuario(payload).subscribe({
      next: () => {
        this.toastr.success('✅ Usuario inactivado', '', {
          timeOut: 5000, progressBar: true, positionClass: 'toast-top-right'
        });
        this.cargarUsuarios();
      },
      error: (error) => { this.toastr.error('❌ Ocurrió un error', error.error?.message); }
    });
  }
}