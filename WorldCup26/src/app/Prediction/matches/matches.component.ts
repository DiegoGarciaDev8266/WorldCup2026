import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConexionApiPredictionService } from 'src/app/core/services/conexion-api-prediction.service';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss']
})
export class MatchesComponent {

  matches: any[] = [];
  equipos: any[] = [];
  mostrarModal: boolean = false;
  cargando: boolean = false;

  nuevoMatch = {
    matchDate: '',
    homeScore: 0,
    awayScore: 0,
    homeTeamId: null,
    awayTeamId: null,
    status: 'SCHEDULED'
  };

  constructor(
    private conexionService: ConexionApiPredictionService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.cargarMatches();
    this.cargarEquipos();
  }

  cargarMatches() {
    this.conexionService.GetMatches().subscribe({
      next: (res: any) => {
        this.matches = res.data;
        console.log("✅ Matches:", this.matches);
      },
      error: (err) => console.error('❌ Error matches:', err)
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
    this.nuevoMatch = {
      matchDate: '', homeScore: 0, awayScore: 0,
      homeTeamId: null, awayTeamId: null, status: 'SCHEDULED'
    };
  }

  crearMatch() {
    this.cargando = true;
    this.conexionService.CreateMatch(this.nuevoMatch).subscribe({
      next: (res: any) => {
        this.toastr.success('Partido creado exitosamente');
        this.cerrarModal();
        this.cargarMatches();
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error creando match:', err);
        this.toastr.error('Error al crear el partido');
        this.cargando = false;
      }
    });
  }

}
