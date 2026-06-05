import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  today = new Date();
  grupos = ['A','B','C','D','E','F','G','H','I','J','K','L'];
  tablaPosiciones: any[] = [];
  grupoCarrusel = 'A';
  indiceCarrusel = 0;
  intervalo: any;

  // Subject para evitar memory leaks (buena práctica con Observer)
  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    // Observer Pattern: se suscribe al flujo de datos
    this.dashboardService.posiciones$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.tablaPosiciones = data;
        if (data.length > 0) this.iniciarCarrusel();
      });

    this.dashboardService.cargarPosiciones().subscribe();
  }

  ngOnDestroy(): void {
    if (this.intervalo) clearInterval(this.intervalo);
    // Limpia todas las suscripciones
    this.destroy$.next();
    this.destroy$.complete();
  }

  iniciarCarrusel() {
    if (this.intervalo) clearInterval(this.intervalo);
    this.intervalo = setInterval(() => {
      this.indiceCarrusel = (this.indiceCarrusel + 1) % this.grupos.length;
      this.grupoCarrusel = this.grupos[this.indiceCarrusel];
    }, 4000);
  }

  irGrupo(grupo: string) {
    this.grupoCarrusel = grupo;
    this.indiceCarrusel = this.grupos.indexOf(grupo);
    this.iniciarCarrusel();
  }

  get posicionesGrupoCarrusel() {
    return this.tablaPosiciones
      .filter(p => p.Grupo === this.grupoCarrusel)
      .sort((a, b) => {
        if (b.Puntos !== a.Puntos) return b.Puntos - a.Puntos;
        return (b.GolesAFavor - b.GolesEnContra) - (a.GolesAFavor - a.GolesEnContra);
      });
  }
}