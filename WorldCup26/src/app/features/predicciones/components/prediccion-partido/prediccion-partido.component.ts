import { Component, OnInit } from '@angular/core';
import { PrediccionService } from '../../services/prediccion.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-prediccion-partido',
  templateUrl: './prediccion-partido.component.html',
  styleUrls: ['./prediccion-partido.component.scss']
})
export class PrediccionPartidoComponent implements OnInit {

  equipos: any[] = [];
  equipoLocal = '';
  equipoVisitante = '';
  resultado: any = null;
  cargando = false;
  cargandoEquipos = true;
  mostrarExplicacion = false;

  constructor(
    private prediccionService: PrediccionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.prediccionService.getEquipos().subscribe({
      next: (data: any) => {
        this.equipos = (data?.data || data || [])
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        this.cargandoEquipos = false;
      },
      error: () => {
        this.toastr.error('❌ Error al cargar equipos');
        this.cargandoEquipos = false;
      }
    });
  }

  predecir() {
    if (!this.equipoLocal || !this.equipoVisitante) {
      this.toastr.error('❌ Selecciona ambos equipos');
      return;
    }
    if (this.equipoLocal === this.equipoVisitante) {
      this.toastr.error('❌ Los equipos no pueden ser iguales');
      return;
    }

    this.cargando = true;
    this.resultado = null;
    this.mostrarExplicacion = false;

    this.prediccionService.predecirPartido(
      this.equipoLocal,
      this.equipoVisitante
    ).subscribe({
      next: (data: any) => {
        this.resultado = data?.data || data;
        this.cargando = false;
        this.toastr.success('✅ Predicción generada');
      },
      error: () => {
        this.toastr.error('❌ Error al generar predicción');
        this.cargando = false;
      }
    });
  }

  limpiar() {
    this.equipoLocal = '';
    this.equipoVisitante = '';
    this.resultado = null;
    this.mostrarExplicacion = false;
  }
}