import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root' // ← SINGLETON
})
export class ResultadosService {

  // OBSERVER PATTERN - 3 flujos de datos independientes
  private posicionesSubject = new BehaviorSubject<any[]>([]);
  private logSubject = new BehaviorSubject<any[]>([]);
  private partidosFinSubject = new BehaviorSubject<any[]>([]);

  posiciones$ = this.posicionesSubject.asObservable();
  log$ = this.logSubject.asObservable();
  partidosFinalizados$ = this.partidosFinSubject.asObservable();

  constructor(private api: ApiService) {}

  cargarPartidosFinalizados(): Observable<any[]> {
    return this.api.get<any[]>('/cup/GetPartidosFinalizados').pipe(
      tap(data => this.partidosFinSubject.next(data))
    );
  }

  registrarResultado(payload: any): Observable<any> {
    return this.api.put<any>('/cup/RegistrarResultado', payload).pipe(
      tap(() => {
        this.cargarPartidosFinalizados().subscribe();
        this.cargarPosiciones().subscribe();
        this.cargarLog().subscribe();
      })
    );
  }

  cargarPosiciones(): Observable<any[]> {
    return this.api.get<any[]>('/cup/GetTablaPosiciones').pipe(
      tap(data => this.posicionesSubject.next(data))
    );
  }

  cargarLog(): Observable<any[]> {
    return this.api.get<any[]>('/cup/GetLogAuditoria').pipe(
      tap(data => this.logSubject.next(data))
    );
  }
}