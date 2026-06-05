import { TestBed } from '@angular/core/testing';

import { ConexionDBService } from './conexion-db.service';

describe('ConexionDBService', () => {
  let service: ConexionDBService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConexionDBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
