import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConexionApiPredictionService } from 'src/app/core/services/conexion-api-prediction.service';


@Component({
  selector: 'app-teams-statistics',
  templateUrl: './teams-statistics.component.html',
  styleUrls: ['./teams-statistics.component.scss']
})
export class TeamsStatisticsComponent implements OnInit {

  equipos: any[] = [];
  equipoSeleccionadoId: number | null = null;
  estadisticas: any = null;
  cargando: boolean = false;


  constructor(
    private conexionService: ConexionApiPredictionService,
    private toastr: ToastrService
  ) { }


  ngOnInit() {
    this.conexionService.GetTeams().subscribe({
      next: (res: any) => {
        this.equipos = res; // array directo desde Node
        console.log(this.equipos)
      },
      error: (err) => console.error('Error cargando equipos:', err)
    });
  }

  onEquipoChange() {
      console.log("🔄 Equipo seleccionado ID:", this.equipoSeleccionadoId); // ← log

    if (!this.equipoSeleccionadoId) return;

    this.cargando = true;
    this.estadisticas = null;

    this.conexionService.GetTeamstatistics(this.equipoSeleccionadoId).subscribe({
      next: (res: any) => {
        this.estadisticas = res.data; // ← extrae .data del response de Spring
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando estadísticas:', err);
        this.cargando = false;
      }
    });
  }


}


