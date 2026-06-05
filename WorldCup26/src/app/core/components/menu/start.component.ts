import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit, OnDestroy {

  isExpanded = false;
  subMenu = { config: false, pred: false };
  esAdmin = false;
  hayPartidosEnVivo = false;

  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.usuario$.subscribe((usuario: any) => {
      this.esAdmin = usuario?.rol === 2;
    });

    this.verificarPartidosEnVivo();

    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.verificarPartidosEnVivo());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar() { this.isExpanded = !this.isExpanded; }

  toggleSub(menu: string) {
    this.subMenu[menu as keyof typeof this.subMenu] =
      !this.subMenu[menu as keyof typeof this.subMenu];
  }

  Salir() { this.authService.logout(); }

  verificarPartidosEnVivo() {
    fetch('http://localhost:3000/cup/GetPartidosEnVivo', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(r => r.json())
    .then((data: any[]) => this.hayPartidosEnVivo = data.length > 0)
    .catch(() => this.hayPartidosEnVivo = false);
  }
}