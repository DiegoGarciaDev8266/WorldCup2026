import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrediccionService {

  constructor(private api: ApiService) {}

  // Obtener equipos del modelo predictivo
  getEquipos(): Observable<any> {
    return this.api.get('/predit/teams');
  }

  // Predecir ganador de partido
  predecirPartido(homeTeamName: string, awayTeamName: string): Observable<any> {
    return this.api.post('/predit/predictions', {
      homeTeamName,
      awayTeamName
    });
  }

  // Predecir campeón del torneo
  predecirCampeon(teamNames: string[]): Observable<any> {
    return this.api.post('/predit/predictions/tournament', teamNames);
  }

  // Historial de predicciones de partido
  getHistorial(): Observable<any> {
    return this.api.get('/predit/predictions');
  }

  // Historial de predicciones de torneo
  getHistorialTorneo(): Observable<any> {
    return this.api.get('/predit/predictions/tournament');
  }
}