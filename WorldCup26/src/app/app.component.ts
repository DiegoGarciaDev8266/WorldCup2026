import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { SocketService } from './core/services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  usuarioLogueado = false;
  notificaciones: any[] = [];
  mostrarNotificaciones = false;
  notifActiva: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.usuario$.subscribe((usuario: any) => {
      this.usuarioLogueado = !!usuario;
    });

    // Partido iniciado
    this.socketService.partidoIniciado$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        const notif = {
          tipo: 'vivo',
          titulo: '⚽ Partido en vivo',
          mensaje: `${data.NombreLocal} vs ${data.NombreVisitante} acaba de comenzar`,
          detalle: `El partido entre ${data.NombreLocal} y ${data.NombreVisitante} ha comenzado. ¡Síguelo en tiempo real!`,
          ruta: '/en-vivo',
          btnTexto: 'Ver en vivo',
          fecha: new Date()
        };
        this.agregarNotificacion(notif);
        this.notifActiva = notif;
      });

    // Partido programado
    this.socketService.partidoProgramado$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        const notif = {
          tipo: 'programado',
          titulo: '📅 Nuevo partido programado',
          mensaje: `Fase: ${data.Fase} — ${data.Estadio}`,
          detalle: `Se ha programado un nuevo partido.\nFase: ${data.Fase}\nEstadio: ${data.Estadio}\nFecha: ${new Date(data.FechaPartido).toLocaleString('es-CO')}`,
          ruta: '/consulta-partidos',
          btnTexto: 'Ver partidos',
          fecha: new Date()
        };
        this.agregarNotificacion(notif);
        this.notifActiva = notif;
      });

    // Partido actualizado
    this.socketService.partidoActualizado$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        const notif = {
          tipo: 'actualizado',
          titulo: '✏️ Partido actualizado',
          mensaje: `Fase: ${data.Fase} — ${data.Estadio}`,
          detalle: `Un partido ha sido actualizado.\nFase: ${data.Fase}\nEstadio: ${data.Estadio}\nFecha: ${new Date(data.FechaPartido).toLocaleString('es-CO')}`,
          ruta: '/consulta-partidos',
          btnTexto: 'Ver partidos',
          fecha: new Date()
        };
        this.agregarNotificacion(notif);
        this.notifActiva = notif;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  agregarNotificacion(notif: any) {
    this.notificaciones.unshift(notif);
    if (this.notificaciones.length > 10) this.notificaciones.pop();
  }

  toggleNotif(event: Event) {
    event.stopPropagation();
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
  }

  abrirNotif(notif: any) {
    this.notifActiva = notif;
    this.mostrarNotificaciones = false;
  }

  cerrarModal() {
    this.notifActiva = null;
  }

  irDesdeModal() {
    if (this.notifActiva?.ruta) {
      this.router.navigate([this.notifActiva.ruta]);
    }
    this.notifActiva = null;
    this.mostrarNotificaciones = false;
  }

  limpiarNotificaciones() {
    this.notificaciones = [];
    this.mostrarNotificaciones = false;
  }
}