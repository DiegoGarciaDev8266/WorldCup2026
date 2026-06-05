import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root' // ← SINGLETON
})
export class ConsultaPartidosService {

  // OBSERVER PATTERN
  private partidosSubject = new BehaviorSubject<any[]>([]);
  private equiposSubject = new BehaviorSubject<any[]>([]);

  partidos$ = this.partidosSubject.asObservable();
  equipos$ = this.equiposSubject.asObservable();

  constructor(private api: ApiService) {}

  cargarPartidos(): Observable<any[]> {
    return this.api.get<any[]>('/cup/GetPartidos').pipe(
      tap(data => this.partidosSubject.next(data))
    );
  }

  cargarEquipos(): Observable<any[]> {
    return this.api.get<any[]>('/cup/GetEquipos').pipe(
      tap(data => this.equiposSubject.next(data))
    );
  }
}