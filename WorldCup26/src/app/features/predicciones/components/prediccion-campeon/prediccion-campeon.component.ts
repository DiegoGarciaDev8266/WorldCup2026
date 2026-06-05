import { Component, OnInit } from '@angular/core';
import { PrediccionService } from '../../services/prediccion.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-prediccion-campeon',
  templateUrl: './prediccion-campeon.component.html',
  styleUrls: ['./prediccion-campeon.component.scss']
})
export class PrediccionCampeonComponent implements OnInit {

  equipos: any[] = [];
  equiposSeleccionados: string[] = [];
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
        this.equiposSeleccionados = this.equipos.map((e: any) => e.name);
        this.cargandoEquipos = false;
      },
      error: () => {
        this.toastr.error('❌ Error al cargar equipos');
        this.cargandoEquipos = false;
      }
    });
  }

  toggleEquipo(nombre: string) {
    const idx = this.equiposSeleccionados.indexOf(nombre);
    if (idx >= 0) {
      if (this.equiposSeleccionados.length <= 2) {
        this.toastr.warning('⚠️ Mínimo 2 equipos requeridos');
        return;
      }
      this.equiposSeleccionados.splice(idx, 1);
    } else {
      this.equiposSeleccionados.push(nombre);
    }
  }

  estaSeleccionado(nombre: string): boolean {
    return this.equiposSeleccionados.includes(nombre);
  }

  seleccionarTodos() {
    this.equiposSeleccionados = this.equipos.map((e: any) => e.name);
  }

  limpiarSeleccion() {
    this.equiposSeleccionados = [];
  }

  predecir() {
    if (this.equiposSeleccionados.length < 2) {
      this.toastr.error('❌ Selecciona al menos 2 equipos');
      return;
    }

    this.cargando = true;
    this.resultado = null;
    this.mostrarExplicacion = false;

    this.prediccionService.predecirCampeon(
      this.equiposSeleccionados
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
    this.resultado = null;
    this.mostrarExplicacion = false;
    this.seleccionarTodos();
  }

  getTop4Array(): string[] {
    if (!this.resultado?.top4) return [];
    return this.resultado.top4.split(', ');
  }
}