import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TablaPosicionesService } from '../../services/tabla-posiciones.service';

@Component({
  selector: 'app-tabla-posiciones',
  templateUrl: './tabla-posiciones.component.html',
  styleUrls: ['./tabla-posiciones.component.scss']
})
export class TablaPosicionesComponent implements OnInit, OnDestroy {

  grupos = ['A','B','C','D','E','F','G','H','I','J','K','L'];
  grupoActivo = 'A';
  tablaPosiciones: any[] = [];
  cargando = true;

  private destroy$ = new Subject<void>();

  constructor(private tablaPosicionesService: TablaPosicionesService) {}

  ngOnInit(): void {
    // Observer Pattern
    this.tablaPosicionesService.posiciones$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => {
        this.tablaPosiciones = data;
        this.cargando = false;
      });

    this.tablaPosicionesService.cargarPosiciones().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get posicionesGrupoActivo() {
    return this.tablaPosiciones
      .filter(p => p.Grupo === this.grupoActivo)
      .sort((a, b) => {
        if (b.Puntos !== a.Puntos) return b.Puntos - a.Puntos;
        const difB = b.GolesAFavor - b.GolesEnContra;
        const difA = a.GolesAFavor - a.GolesEnContra;
        if (difB !== difA) return difB - difA;
        return b.GolesAFavor - a.GolesAFavor;
      });
  }

  get todosLosGrupos() {
    return this.grupos.map(g => ({
      grupo: g,
      equipos: this.tablaPosiciones
        .filter(p => p.Grupo === g)
        .sort((a, b) => {
          if (b.Puntos !== a.Puntos) return b.Puntos - a.Puntos;
          return (b.GolesAFavor - b.GolesEnContra) - (a.GolesAFavor - a.GolesEnContra);
        })
    }));
  }

  getClasificacion(index: number): string {
  if (index < 2) return 'clasifica-directo';
  return '';
  }

  
}