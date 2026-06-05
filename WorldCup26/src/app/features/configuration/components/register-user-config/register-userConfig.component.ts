import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConexionDBService } from 'src/app/core/services/conexion-db.service';
import { register_userConfigMoldel } from 'src/app/shared/models/registerUserConfig.model';

@Component({
  selector: 'app-register-userConfig',
  templateUrl: './register-userConfig.component.html',
  styleUrls: ['./register-userConfig.component.scss']
})
export class RegisterUserConfigComponent implements OnInit {

  users: any;
  usuarioVer: any = null;
  usuarioAEliminar: any = null;

  public form_resgiter_userConfig: FormGroup;
  resgiter_userConfig = new register_userConfigMoldel("", "", "", "");

  constructor(
    private ConexionServiceSql: ConexionDBService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.form_resgiter_userConfig = new FormGroup({
      txtnombre: new FormControl('', Validators.required),
      txtemail: new FormControl('', [Validators.required,
        Validators.pattern('^[^@]+@[^@]+\.[a-zA-Z]{2,}$')]),
      txtpass: new FormControl('', Validators.required),
      txtrol: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this.mostrarUsuario();
  }

  Onsumit() {
    if (this.form_resgiter_userConfig.invalid) {
      this.toastr.info('⚠️ Todos los campos son obligatorios');
      return;
    }

    this.resgiter_userConfig = new register_userConfigMoldel(
      this.form_resgiter_userConfig.value.txtnombre.toString(),
      this.form_resgiter_userConfig.value.txtemail.toString(),
      this.form_resgiter_userConfig.value.txtpass.toString(),
      this.form_resgiter_userConfig.value.txtrol.toString(),
    );

    this.ConexionServiceSql.RegistroUsuarioConfig(this.resgiter_userConfig).subscribe({
      next: () => {
        this.toastr.success('✅ Usuario registrado exitosamente', '', {
          timeOut: 5000, progressBar: true,
          progressAnimation: 'increasing', positionClass: 'toast-top-right'
        });
        this.form_resgiter_userConfig.reset();
        this.mostrarUsuario();
      },
      error: (error: any) => {
        this.toastr.error('❌ Ocurrió un error', error.error?.message);
      }
    });
  }

  mostrarUsuario() {
    this.ConexionServiceSql.GerUserConfig().subscribe({
      next: (response) => {
        this.users = response;
      },
      error: (error: any) => {
        this.toastr.error('❌ Ocurrió un error', error.error?.message);
      }
    });
  }

  abrirModalEditar(usuario: any) {
    this.resgiter_userConfig = { ...usuario };
  }

  verUsuario(user: any) {
    this.usuarioVer = { ...user };
  }

  abrirModalEliminar(user: any) {
    this.usuarioAEliminar = user;
  }

  confirmarEliminar() {
    if (!this.usuarioAEliminar) return;
    this.ConexionServiceSql.EliminarUsuario(this.usuarioAEliminar.ID).subscribe({
      next: () => {
        this.toastr.success('✅ Usuario eliminado correctamente', '', {
          timeOut: 5000, progressBar: true,
          progressAnimation: 'increasing', positionClass: 'toast-top-right'
        });
        this.usuarioAEliminar = null;
        this.mostrarUsuario();
      },
      error: (err: any) => {
        this.toastr.error('❌ Ocurrió un error', err.error?.message);
      }
    });
  }
  guardarCambios() {
    if (!this.resgiter_userConfig.ROL) {
      this.toastr.info('⚠️ Debe seleccionar un rol');
      return;
    }

    this.ConexionServiceSql.actualizarUsuario(this.resgiter_userConfig).subscribe({
      next: () => {
        this.toastr.success('✅ Usuario actualizado correctamente', '', {
          timeOut: 5000, progressBar: true,
          progressAnimation: 'increasing', positionClass: 'toast-top-right'
        });
        this.mostrarUsuario();
      },
      error: (err: any) => {
        this.toastr.error('❌ Ocurrió un error', err.error?.message);
      }
    });
  }
}