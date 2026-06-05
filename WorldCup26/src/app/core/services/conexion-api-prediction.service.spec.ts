import { TestBed } from '@angular/core/testing';

import { ConexionApiPredictionService } from './conexion-api-prediction.service';

describe('ConexionApiPredictionService', () => {
  let service: ConexionApiPredictionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConexionApiPredictionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
