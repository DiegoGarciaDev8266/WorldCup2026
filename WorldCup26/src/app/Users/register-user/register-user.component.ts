import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConexionDBService } from 'src/app/shared/conexion-db.service';
import { register_userMoldel } from 'src/app/shared/register_user.model';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss']
})
export class RegisterUserComponent {

  public form_resgiter_user: FormGroup;

  register_user = new register_userMoldel("", "", "");

  constructor(
    private ConexionServiceSql: ConexionDBService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService) {

    this.form_resgiter_user = new FormGroup({
      txtnombre: new FormControl('', Validators.required),
      txtemail: new FormControl('', [Validators.required, Validators.pattern('^[^@]+@[^@]+\.[a-zA-Z]{2,}$')]),
      txtpass: new FormControl('', Validators.required),

    });
  }
  ngOnInit() {

  }
  onSumit() {
    if (this.form_resgiter_user.invalid) {
      console.log('todos los campor son obligarios')
      this.toastr.info('¡todos los campos son obligatrios!');

      return;
    }

    this.register_user = new register_userMoldel(
      this.form_resgiter_user.value.txtnombre.toString(),
      this.form_resgiter_user.value.txtemail.toString(),
      this.form_resgiter_user.value.txtpass.toString(),

    );

    this.ConexionServiceSql.RegistroUsuario(this.register_user).subscribe({
      next: (response) => {
        console.log('registro exitoso:', response)
        this.toastr.success('registro exitoso:', response), {
          timeOut: 5000,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        }

        this.router.navigate(['/login']);


      },
      error: (error) => {
        console.error('❌ ocurrio un error:', error.error.message);
        this.toastr.error("❌ ocurrio un error", error.error.message)

        // console.log('contrasena',this.register_user.password)

      }
    });
  }
}
