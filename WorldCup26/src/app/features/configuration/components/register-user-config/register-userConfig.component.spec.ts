import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterUserConfigComponent } from './register-userConfig.component';

describe('RegisterUserConfigComponent', () => {
  let component: RegisterUserConfigComponent;
  let fixture: ComponentFixture<RegisterUserConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterUserConfigComponent]
    });
    fixture = TestBed.createComponent(RegisterUserConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
