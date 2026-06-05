import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root' // ← SINGLETON
})
export class EquiposService {

  // OBSERVER PATTERN
  private equiposSubject = new BehaviorSubject<any[]>([]);
  equipos$ = this.equiposSubject.asObservable();

  constructor(private api: ApiService) {}

  cargarEquipos(): Observable<any[]> {
    return this.api.get<any[]>('/cup/GetEquipos').pipe(
      tap(data => this.equiposSubject.next(data))
    );
  }

  registrarEquipo(equipo: any): Observable<any> {
    return this.api.post<any>('/cup/RegistrarEquipo', equipo).pipe(
      tap(() => this.cargarEquipos().subscribe())
    );
  }

  actualizarEquipo(equipo: any): Observable<any> {
    return this.api.put<any>('/cup/ActualizarEquipo', equipo).pipe(
      tap(() => this.cargarEquipos().subscribe())
    );
  }

  eliminarEquipo(id: number): Observable<any> {
    return this.api.delete<any>(`/cup/EliminarEquipo/${id}`).pipe(
      tap(() => this.cargarEquipos().subscribe())
    );
  }
}