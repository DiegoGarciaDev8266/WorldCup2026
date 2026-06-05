import { Component, OnInit, NgZone } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/services/auth.service';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public chartType: ChartType = 'bar';
  public radarChartType: ChartType = 'radar';
  public doughnutChartType: ChartType = 'doughnut';
  public lineChartType: ChartType = 'line';

  public form_login: FormGroup;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private ngZone: NgZone
  ) {
    this.form_login = new FormGroup({
      txtemail: new FormControl('', [Validators.required,
        Validators.pattern('^[^@]+@[^@]+\.[a-zA-Z]{2,}$')]),
      txtpass: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.inicializarGoogle();
  }

  inicializarGoogle() {
    // Espera a que el script de Google cargue
    const interval = setInterval(() => {
      if (typeof google !== 'undefined') {
        clearInterval(interval);
        google.accounts.id.initialize({
          client_id: '935182192785-avd8kj1natmjodp83cp2mrutlc7phi5r.apps.googleusercontent.com',
          callback: (response: any) => {
            this.ngZone.run(() => {
              this.handleGoogleResponse(response);
            });
          }
        });
      }
    }, 100);
  }

  loginConGoogle() {
    google.accounts.id.prompt();
  }

  handleGoogleResponse(response: any) {
    const idToken = response.credential;
    this.authService.loginConGoogle(idToken).subscribe({
      next: () => {
        this.toastr.success('¡Bienvenido!', 'WorldCup 2026');
        this.router.navigate(['/Dashboard']);
      },
      error: (err: any) => {
        this.toastr.error('❌ Error al iniciar sesión con Google', err.error?.message);
      }
    });
  }

  login() {
    if (this.form_login.invalid) {
      this.toastr.error('¡Todos los campos son obligatorios!');
      return;
    }

    const email = this.form_login.value.txtemail;
    const password = this.form_login.value.txtpass;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.toastr.success('¡Bienvenido!', 'WorldCup 2026');
        this.router.navigate(['/Dashboard']);
      },
      error: (error: any) => {
        this.toastr.error('¡Aviso!', error.error?.message || 'Error al iniciar sesión');
      }
    });
  }

  // Charts
  public chartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Argentina', 'Germany'],
    datasets: [{ data: [3, 1], label: 'Goals' }]
  };

  radarChartData: ChartConfiguration<'radar'>['data'] = {
    labels: ['Attack', 'Defense', 'Speed', 'Passing', 'Dribbling'],
    datasets: [
      { label: 'Argentina', data: [90, 80, 85, 88, 92] },
      { label: 'Germany', data: [85, 87, 80, 84, 78] }
    ]
  };

  doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Argentina', 'Germany'],
    datasets: [{ data: [60, 40] }]
  };

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Match 1', 'Match 2', 'Match 3', 'Match 4'],
    datasets: [{ label: 'Argentina Performance', data: [2, 3, 4, 3] }]
  };

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };
}