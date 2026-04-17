import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroResultadosComponent } from './registro-resultados.component';

describe('RegistroResultadosComponent', () => {
  let component: RegistroResultadosComponent;
  let fixture: ComponentFixture<RegistroResultadosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistroResultadosComponent]
    });
    fixture = TestBed.createComponent(RegistroResultadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
