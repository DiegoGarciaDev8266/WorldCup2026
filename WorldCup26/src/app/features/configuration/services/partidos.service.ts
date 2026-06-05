import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root' // ← SINGLETON
})
export class PartidosService {

  // OBSERVER PATTERN
  private partidosSubject = new BehaviorSubject<any[]>([]);
  partidos$ = this.partidosSubject.asObservable();

  constructor(private api: ApiService) {}

  cargarPartidos(): Observable<any[]> {
    return this.api.get<any[]>('/cup/GetPartidos').pipe(
      tap(data => this.partidosSubject.next(data))
    );
  }

  registrarPartido(partido: any): Observable<any> {
    return this.api.post<any>('/cup/RegistrarPartido', partido).pipe(
      tap(() => this.cargarPartidos().subscribe())
    );
  }

  actualizarPartido(partido: any): Observable<any> {
    return this.api.put<any>('/cup/ActualizarPartido', partido).pipe(
      tap(() => this.cargarPartidos().subscribe())
    );
  }

  eliminarPartido(id: number): Observable<any> {
    return this.api.delete<any>(`/cup/EliminarPartido/${id}`).pipe(
      tap(() => this.cargarPartidos().subscribe())
    );
  }
}