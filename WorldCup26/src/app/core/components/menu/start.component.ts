import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit, OnDestroy {

  isExpanded = false;
  subMenu: any = { config: false, pred: false };
  esAdmin = false;
  hayPartidosEnVivo = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.usuario$.subscribe((usuario: any) => {
      this.esAdmin = usuario?.rol === 2;
    });

    this.verificarPartidosEnVivo();

    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.verificarPartidosEnVivo());

    this.socketService.partidoIniciado$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.hayPartidosEnVivo = true;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
    if (!this.isExpanded) {
      this.subMenu.config = false;
      this.subMenu.pred = false;
    }
  }

  // FIX: expande el sidebar automáticamente si está contraído
  toggleSub(menu: string) {
    if (!this.isExpanded) {
      this.isExpanded = true;
      setTimeout(() => { this.subMenu[menu] = true; }, 150);
    } else {
      this.subMenu[menu] = !this.subMenu[menu];
    }
  }

  Salir() {
    this.authService.logout();
  }

  verificarPartidosEnVivo() {
    fetch('http://localhost:3000/cup/GetPartidosEnVivo', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(r => r.json())
    .then((data: any[]) => this.hayPartidosEnVivo = data.length > 0)
    .catch(() => this.hayPartidosEnVivo = false);
  }
}