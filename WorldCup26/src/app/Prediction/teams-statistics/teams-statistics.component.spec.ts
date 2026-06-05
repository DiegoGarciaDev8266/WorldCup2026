import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsStatisticsComponent } from './teams-statistics.component';

describe('TeamsStatisticsComponent', () => {
  let component: TeamsStatisticsComponent;
  let fixture: ComponentFixture<TeamsStatisticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamsStatisticsComponent]
    });
    fixture = TestBed.createComponent(TeamsStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
