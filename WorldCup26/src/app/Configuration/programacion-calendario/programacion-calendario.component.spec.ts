import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramacionCalendarioComponent } from './programacion-calendario.component';

describe('ProgramacionCalendarioComponent', () => {
  let component: ProgramacionCalendarioComponent;
  let fixture: ComponentFixture<ProgramacionCalendarioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProgramacionCalendarioComponent]
    });
    fixture = TestBed.createComponent(ProgramacionCalendarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
