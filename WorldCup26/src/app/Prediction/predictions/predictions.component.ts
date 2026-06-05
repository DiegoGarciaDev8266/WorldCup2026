import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConexionApiPredictionService } from 'src/app/services/shared/conexion-api-prediction.service';

@Component({
  selector: 'app-predictions',
  templateUrl: './predictions.component.html',
  styleUrls: ['./predictions.component.scss']
})
export class PredictionsComponent implements OnInit {

  predicciones: any[] = [];
  equipos: any[] = [];
  mostrarModal: boolean = false;
  cargando: boolean = false;
  prediccionDetalle: any = null;
  mostrarDetalle: boolean = false;

  nuevaPrediccion = {
    homeTeamName: '',
    awayTeamName: ''
  };

  constructor(
    private conexionService: ConexionApiPredictionService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.cargarPredicciones();
    this.cargarEquipos();
  }

  cargarPredicciones() {
    this.conexionService.GetPredictions().subscribe({
      next: (res: any) => {
        this.predicciones = res.data;
        console.log("✅ Predicciones:", this.predicciones);
      },
      error: (err) => console.error('❌ Error predicciones:', err)
    });
  }

  cargarEquipos() {
    this.conexionService.GetTeams().subscribe({
      next: (res: any) => {
        this.equipos = res;
      },
      error: (err) => console.error('❌ Error equipos:', err)
    });
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevaPrediccion = { homeTeamName: '', awayTeamName: '' };
  }

  verDetalle(prediccion: any) {
    this.prediccionDetalle = prediccion;
    this.mostrarDetalle = true;
  }

  cerrarDetalle() {
    this.prediccionDetalle = null;
    this.mostrarDetalle = false;
  }

  crearPrediccion() {
    if (!this.nuevaPrediccion.homeTeamName || !this.nuevaPrediccion.awayTeamName) {
      this.toastr.warning('Selecciona ambos equipos');
      return;
    }
    this.cargando = true;
    this.conexionService.CreatePrediction(this.nuevaPrediccion).subscribe({
      next: (res: any) => {
        this.toastr.success('Predicción generada exitosamente');
        this.cerrarModal();
        this.cargarPredicciones();
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.toastr.error('Error al generar predicción');
        this.cargando = false;
      }
    });
  }
}
