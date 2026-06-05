import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ResultadosService } from '../../services/resultados.service';
@Component({
  selector: 'app-registro-resultados',
  templateUrl: './registro-resultados.component.html',
  styleUrls: ['./registro-resultados.component.scss']
})
export class RegistroResultadosComponent implements OnInit, OnDestroy {

  logAuditoria: any[] = [];
  logFiltrado: any[] = [];
  filtroModulo = '';
  filtroAccion = '';

  private destroy$ = new Subject<void>();

  constructor(private resultadosService: ResultadosService) {}

  ngOnInit(): void {
    this.resultadosService.log$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => {
        this.logAuditoria = data;
        this.filtrar();
      });

    this.resultadosService.cargarLog().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  filtrar() {
    this.logFiltrado = this.logAuditoria.filter(log => {
      const moduloOk = !this.filtroModulo || log.Modulo === this.filtroModulo;
      const accionOk = !this.filtroAccion || log.TipoAccion === this.filtroAccion;
      return moduloOk && accionOk;
    });
  }

  getModuloBadge(modulo: string): string {
    const map: any = {
      'EQUIPOS':    'bg-primary',
      'PARTIDOS':   'bg-info text-dark',
      'RESULTADOS': 'bg-success',
      'ROLES':      'bg-warning text-dark',
      'USUARIOS':   'bg-secondary',
      'SISTEMA':    'bg-dark'
    };
    return map[modulo] || 'bg-secondary';
  }

  getAccionBadge(accion: string): string {
    const map: any = {
      'REGISTRO':            'bg-success',
      'ACTUALIZACIÓN':       'bg-warning text-dark',
      'ELIMINACIÓN':         'bg-danger',
      'INACTIVACIÓN':        'bg-secondary',
      'REGISTRO_RESULTADO':  'bg-primary'
    };
    return map[accion] || 'bg-secondary';
  }
}