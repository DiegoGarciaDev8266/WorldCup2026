import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { ConexionDBService } from 'src/app/shared/conexion-db.service';
import { loginMoldel } from 'src/app/shared/login.model';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public chartType: ChartType = 'bar';
  // 1 RADAR CHART
  public radarChartType: ChartType = 'radar';
  // 2 DOUGHNUT CHART
  public doughnutChartType: ChartType = 'doughnut';
  // 4 LINE CHART
  public lineChartType: ChartType = 'line';

  public form_login: FormGroup;

  login_user = new loginMoldel("", "");

  constructor(
    private ConexionServiceSql: ConexionDBService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService) {

    this.form_login = new FormGroup({
      txtemail: new FormControl('', [Validators.required, Validators.pattern('^[^@]+@[^@]+\.[a-zA-Z]{2,}$')]),
      txtpass: new FormControl('', Validators.required),
    });


  }
  ngOnInit(): void {


  }

  login() {
    if (this.form_login.invalid) {
      console.log("todos los campos son obligatrios")
      this.toastr.error('¡todos los campos son obligatrios!');
      return;
    }

    this.login_user = {
      email: this.form_login.value.txtemail,
      password: this.form_login.value.txtpass
    };

    this.ConexionServiceSql.obtenerLogin(this.login_user).subscribe({
      next: (response) => {
        console.log("bienvenido", response)
        this.toastr.success('¡Bienvenido!', 'WorlCup2026!');

        this.router.navigate(['/Dashboard']);
      },
      error: (error) => {
        // Mensaje de error
        console.error('❌ ocurrio un error:', error.error.message);
        this.toastr.error('¡Aviso', error.error.message);


      }
    });
  }



  public chartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Argentina', 'Germany'],
    datasets: [
      { data: [3, 1], label: 'Goals' }
    ]
  };


  radarChartData: ChartConfiguration<'radar'>['data'] = {
    labels: ['Attack', 'Defense', 'Speed', 'Passing', 'Dribbling'],
    datasets: [
      {
        label: 'Argentina',
        data: [90, 80, 85, 88, 92]
      },
      {
        label: 'Germany',
        data: [85, 87, 80, 84, 78]
      }
    ]
  };




  doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Argentina', 'Germany'],
    datasets: [
      {
        data: [60, 40]
      }
    ]
  };




  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Match 1', 'Match 2', 'Match 3', 'Match 4'],
    datasets: [
      {
        label: 'Argentina Performance',
        data: [2, 3, 4, 3]
      }
    ]
  };

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };
}



