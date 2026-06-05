import { Component, OnInit } from '@angular/core';
import { PrediccionService } from '../../services/prediccion.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-prediccion-historial',
  templateUrl: './prediccion-historial.component.html',
  styleUrls: ['./prediccion-historial.component.scss']
})
export class PrediccionHistorialComponent implements OnInit {

  historial: any[] = [];
  historialTorneo: any[] = [];
  cargando = true;
  tabActiva: 'partido' | 'torneo' = 'partido';
  prediccionExpandida: number | null = null;

  constructor(
    private prediccionService: PrediccionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.cargando = true;

    this.prediccionService.getHistorial().subscribe({
      next: (data: any) => {
        const lista = data?.data || data || [];
        this.historial = lista.filter((p: any) =>
          !p.modelVersion?.includes('tournament')
        );
        this.cargando = false;
      },
      error: () => {
        this.toastr.error('❌ Error al cargar historial');
        this.cargando = false;
      }
    });

    this.prediccionService.getHistorialTorneo().subscribe({
      next: (data: any) => {
        this.historialTorneo = data?.data || data || [];
      },
      error: () => {}
    });
  }

  toggleExplicacion(id: number) {
    this.prediccionExpandida = this.prediccionExpandida === id ? null : id;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short',
      year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}