import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root' // ← SINGLETON
})
export class RolesService {

  // OBSERVER PATTERN
  private rolesSubject = new BehaviorSubject<any[]>([]);
  roles$ = this.rolesSubject.asObservable();

  constructor(private api: ApiService) {}

  cargarRoles(): Observable<any[]> {
    return this.api.get<any[]>('/cup/GetRoles').pipe(
      tap(data => this.rolesSubject.next(data))
    );
  }

  actualizarRol(payload: any): Observable<any> {
    return this.api.put<any>('/cup/UpdateRolUsuario', payload).pipe(
      tap(() => this.cargarRoles().subscribe())
    );
  }

  inactivarUsuario(payload: any): Observable<any> {
    return this.api.put<any>('/cup/InactivarUsuario', payload).pipe(
      tap(() => this.cargarRoles().subscribe())
    );
  }
}