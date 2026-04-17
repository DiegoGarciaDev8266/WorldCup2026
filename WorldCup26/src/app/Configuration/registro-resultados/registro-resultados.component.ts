import { Component, OnInit } from '@angular/core';
import { ConexionDBService } from '../../shared/conexion-db.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registro-resultados',
  templateUrl: './registro-resultados.component.html',
  styleUrls: ['./registro-resultados.component.scss']
})
export class RegistroResultadosComponent implements OnInit {

  // Partidos finalizados
  listaPartidos: any[] = [];
  partidoSeleccionado: any = null;
  golesLocal: number = 0;
  golesVisitante: number = 0;

  // Tabla de posiciones
  tablaPosiciones: any[] = [];
  grupoActivo: string = 'A';
  grupos = ['A','B','C','D','E','F','G','H','I','J','K','L'];

  // Log auditoría
  logAuditoria: any[] = [];
  mostrarLog: boolean = false;

  // Vista activa
  vistaActiva: 'resultados' | 'posiciones' | 'auditoria' = 'resultados';

  constructor(
    private conexionService: ConexionDBService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarPartidos();
    this.cargarTablaPosiciones();
    this.cargarLog();
  }

  cargarPartidos() {
    this.conexionService.GetPartidosFinalizados().subscribe({
      next: (data) => { this.listaPartidos = data; },
      error: (err) => { this.toastr.error('❌ Error al cargar partidos', err.error?.message); }
    });
  }

  cargarTablaPosiciones() {
    this.conexionService.GetTablaPosiciones().subscribe({
      next: (data) => { this.tablaPosiciones = data; },
      error: () => {}
    });
  }

  cargarLog() {
    this.conexionService.GetLogAuditoria().subscribe({
      next: (data) => { this.logAuditoria = data; },
      error: () => {}
    });
  }

  seleccionarPartido(p: any) {
    this.partidoSeleccionado = { ...p };
    this.golesLocal = p.GolesLocal ?? 0;
    this.golesVisitante = p.GolesVisitante ?? 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarSeleccion() {
    this.partidoSeleccionado = null;
    this.golesLocal = 0;
    this.golesVisitante = 0;
  }

  registrarResultado() {
    if (!this.partidoSeleccionado) return;
    if (this.golesLocal < 0 || this.golesVisitante < 0) {
      this.toastr.error('❌ Los goles no pueden ser negativos');
      return;
    }

    const payload = {
      PartidoID: this.partidoSeleccionado.PartidoID,
      GolesLocal: this.golesLocal,
      GolesVisitante: this.golesVisitante,
      Estado_Juego: 'Finalizado'
    };

    this.conexionService.RegistrarResultado(payload).subscribe({
      next: () => {
        this.toastr.success('✅ Resultado registrado correctamente', '', {
          timeOut: 5000, progressBar: true,
          progressAnimation: 'increasing', positionClass: 'toast-top-right'
        });
        this.cancelarSeleccion();
        this.cargarPartidos();
        this.cargarTablaPosiciones();
        this.cargarLog();
      },
      error: (err) => { this.toastr.error('❌ Ocurrió un error', err.error?.message); }
    });
  }

  get posicionesGrupoActivo() {
    return this.tablaPosiciones
      .filter(p => p.Grupo === this.grupoActivo)
      .sort((a, b) => {
        if (b.Puntos !== a.Puntos) return b.Puntos - a.Puntos;
        const difB = b.GolesAFavor - b.GolesEnContra;
        const difA = a.GolesAFavor - a.GolesEnContra;
        return difB - difA;
      });
  }

  getResultadoBadge(p: any): string {
    if (p.GolesLocal > p.GolesVisitante) return 'victoria-local';
    if (p.GolesLocal < p.GolesVisitante) return 'victoria-visitante';
    return 'empate';
  }
}