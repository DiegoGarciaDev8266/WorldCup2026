import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionSeleccionesComponent } from './gestion-selecciones.component';

describe('GestionSeleccionesComponent', () => {
  let component: GestionSeleccionesComponent;
  let fixture: ComponentFixture<GestionSeleccionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestionSeleccionesComponent]
    });
    fixture = TestBed.createComponent(GestionSeleccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
