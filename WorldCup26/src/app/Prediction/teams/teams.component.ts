import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { StartComponent } from 'src/app/Home/Menu/start.component';
import { ConexionApiPredictionService } from 'src/app/services/shared/conexion-api-prediction.service';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],

})
export class TeamsComponent implements OnInit {

  equipos: any[] = [];
  equiposFiltrados: any[] = [];
  equipoSeleccionado: any = null;
  mostrarModal: boolean = false;


  constructor(
    private conexionService: ConexionApiPredictionService,
    private toastr: ToastrService
  ) { }


  ngOnInit() {
    this.conexionService.GetTeams().subscribe({
    next: (res: any) => {
      this.equipos = res;          // ← array directo, sin .data
      this.equiposFiltrados = res;
    },
    error: (err) => console.error('Error:', err)
  });

  }

  verDetalle(equipo: any) {
    this.equipoSeleccionado = equipo;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.equipoSeleccionado = null;
  }

}
