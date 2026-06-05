import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root' // ← SINGLETON
})
export class AuthService {

  // OBSERVER PATTERN - BehaviorSubject emite a todos los suscriptores
  private usuarioSubject = new BehaviorSubject<any>(this.cargarUsuario());
  private autenticadoSubject = new BehaviorSubject<boolean>(this.tieneToken());

  usuario$ = this.usuarioSubject.asObservable();
  autenticado$ = this.autenticadoSubject.asObservable();

  constructor(private api: ApiService, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.api.post<any>('/cup/UserAutenticar', { email, password }).pipe(
      tap((response: any) => {
        if (response.ok) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('usuario', JSON.stringify(response.user));
          this.usuarioSubject.next(response.user);
          this.autenticadoSubject.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
    this.autenticadoSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuario(): any {
    return this.usuarioSubject.getValue();
  }

  estaAutenticado(): boolean {
    return this.tieneToken();
  }

  private tieneToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private cargarUsuario(): any {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  }

  getRol(): number | null {
  const usuario = this.getUsuario();
  return usuario ? usuario.rol : null;
  }

  esAdmin(): boolean {
  return this.getRol() === 2;
  }

  loginConGoogle(googleToken: string): Observable<any> {
  return this.api.post<any>('/cup/auth/google', { token: googleToken }).pipe(
    tap((response: any) => {
      if (response.ok) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.user));
        this.usuarioSubject.next(response.user);
        this.autenticadoSubject.next(true);
      }
    })
  );
}
}