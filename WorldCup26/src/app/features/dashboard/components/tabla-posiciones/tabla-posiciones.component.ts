import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TablaPosicionesService } from '../../services/tabla-posiciones.service';
import { ConsultaPartidosService } from '../../services/consulta-partidos.service';

@Component({
  selector: 'app-tabla-posiciones',
  templateUrl: './tabla-posiciones.component.html',
  styleUrls: ['./tabla-posiciones.component.scss']
})
export class TablaPosicionesComponent implements OnInit, OnDestroy {

  tabActiva: 'grupos' | 'bracket' = 'grupos';

  grupos = ['A','B','C','D','E','F','G','H','I','J','K','L'];
  grupoActivo = 'A';
  tablaPosiciones: any[] = [];
  cargando = true;

  eliminatorias: any = {
    Dieciseisavos: [],
    Octavos: [],
    Cuartos: [],
    Semifinal: [],
    'Tercer puesto': [],
    Final: []
  };
  cargandoBracket = true;
  fasesConPartidos: string[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private tablaPosicionesService: TablaPosicionesService,
    private consultaPartidosService: ConsultaPartidosService
  ) {}

  ngOnInit(): void {
    this.tablaPosicionesService.posiciones$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => {
        this.tablaPosiciones = data;
        this.cargando = false;
      });

    this.tablaPosicionesService.cargarPosiciones().subscribe();
    this.cargarEliminatorias();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarEliminatorias() {
    this.cargandoBracket = true;
    this.consultaPartidosService.getEliminatorias().subscribe({
      next: (data: any[]) => {
        Object.keys(this.eliminatorias).forEach(k => this.eliminatorias[k] = []);
        data.forEach((p: any) => {
          if (this.eliminatorias[p.Fase] !== undefined) {
            this.eliminatorias[p.Fase].push(p);
          }
        });
        const orden = ['Dieciseisavos','Octavos','Cuartos','Semifinal','Tercer puesto','Final'];
        this.fasesConPartidos = orden.filter(f => this.eliminatorias[f].length > 0);
        this.cargandoBracket = false;
      },
      error: () => { this.cargandoBracket = false; }
    });
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

  getGanador(partido: any): string {
    if (partido.Estado_Juego !== 'Finalizado') return '';
    if (partido.GolesLocal > partido.GolesVisitante) return 'local';
    if (partido.GolesLocal < partido.GolesVisitante) return 'visitante';
    // Empate — definir por penales
    if (partido.PenalesLocal !== null && partido.PenalesLocal !== undefined &&
        partido.PenalesVisitante !== null && partido.PenalesVisitante !== undefined) {
      if (partido.PenalesLocal > partido.PenalesVisitante) return 'local';
      if (partido.PenalesLocal < partido.PenalesVisitante) return 'visitante';
    }
    return 'empate';
  }

  getFaseLabel(fase: string): string {
    const map: any = {
      'Dieciseisavos': '⚔️ Dieciseisavos de Final',
      'Octavos':       '⚔️ Octavos de Final',
      'Cuartos':       '⚽ Cuartos de Final',
      'Semifinal':     '🔥 Semifinales',
      'Tercer puesto': '🥉 Tercer Puesto',
      'Final':         '🏆 Gran Final'
    };
    return map[fase] || fase;
  }
}