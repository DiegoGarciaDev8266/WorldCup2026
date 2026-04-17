import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConexionDBService } from 'src/app/shared/conexion-db.service';
import { register_userConfigMoldel } from 'src/app/shared/registerUserConfig.model';

@Component({
  selector: 'app-register-userConfig',
  templateUrl: './register-userConfig.component.html',
  styleUrls: ['./register-userConfig.component.scss']
})
export class RegisterUserConfigComponent implements OnInit {

  users: any
  usuarioVer: any = null;   
  

  public form_resgiter_userConfig: FormGroup;

  resgiter_userConfig = new register_userConfigMoldel("", "", "", "");

  constructor(
    private ConexionServiceSql: ConexionDBService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService) {

    this.form_resgiter_userConfig = new FormGroup({
      txtnombre: new FormControl('', Validators.required),
      txtemail: new FormControl('', [Validators.required, Validators.pattern('^[^@]+@[^@]+\.[a-zA-Z]{2,}$')]),
      txtpass: new FormControl('', Validators.required),
      txtrol: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this.mostrarUsuario();




  }

  Onsumit() {
    if (this.form_resgiter_userConfig.invalid) {
      console.log('todos los campor son obligarios')
      this.toastr.info('¡todos los campos son obligatrios!');

      return;
    }

    this.resgiter_userConfig = new register_userConfigMoldel(
      this.form_resgiter_userConfig.value.txtnombre.toString(),
      this.form_resgiter_userConfig.value.txtemail.toString(),
      this.form_resgiter_userConfig.value.txtpass.toString(),
      this.form_resgiter_userConfig.value.txtrol.toString(),


    );

    this.ConexionServiceSql.RegistroUsuarioConfig(this.resgiter_userConfig).subscribe({
      next: (response) => {
        console.log('registro exitoso:', response)
        this.toastr.success('registro exitoso:', response), {
          timeOut: 5000,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        }

        window.location.reload();

      },
      error: (error) => {
        console.error('❌ ocurrio un error:', error.error.message);
        this.toastr.error("❌ ocurrio un error", error.error.message)

        // console.log('contrasena',this.register_user.password)

      }
    });
  }
  mostrarUsuario() {
    this.ConexionServiceSql.GerUserConfig().subscribe({
      next: (response) => {
        console.log('datos:', response);
        this.users = response; // 🔥 AQUÍ ESTÁ LA CLAVE
      },
      error: (error) => {
        console.error('❌ error:', error.error.message);
        this.toastr.error("❌ ocurrio un error", error.error.message);
      }
    });
  }


  abrirModalEditar(register_userConfigMoldel: any) {
    this.resgiter_userConfig = { ...register_userConfigMoldel }; // copia
  }

  verUsuario(user: any) {
  this.usuarioVer = { ...user };
  }




  guardarCambios() {
    if (!this.resgiter_userConfig.ROL) {
      // alert("⚠️ Debe seleccionar un rol");
      this.toastr.info('¡⚠️ Debe seleccionar un rol!');

      return;
    }
    this.ConexionServiceSql.actualizarUsuario(this.resgiter_userConfig).subscribe({
      next: () => {

        this.toastr.success('registro exitoso:'), {
          timeOut: 5000,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        }

        this.mostrarUsuario();
      },

      error: (err) => {
        console.error(err);
        this.toastr.error("❌ ocurrio un error", err.error.message);

      }
    });
  }
  // deleteUser(index: number) {
  //   this.users.splice(index, 1);
  // }

  

  


}
