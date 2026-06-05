import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root' // ← SINGLETON
})
export class DashboardService {

  // OBSERVER PATTERN
  private posicionesSubject = new BehaviorSubject<any[]>([]);
  posiciones$ = this.posicionesSubject.asObservable();

  constructor(private api: ApiService) {}

  cargarPosiciones(): Observable<any[]> {
    return this.api.get<any[]>('/cup/GetTablaPosiciones').pipe(
      tap(data => this.posicionesSubject.next(data))
    );
  }
}