import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ConexionApiPredictionService {

  Api_Prediction = "http://localhost:3306"

  constructor(private http: HttpClient, private router: Router) { }

  GetTeams() {
    return this.http.get<any[]>(`${this.Api_Prediction}/predit/teams`);
  }

  GetTeamstatistics(id: number) {
    return this.http.get<any>(`${this.Api_Prediction}/predit/statistics/${id}`);
  }

  GetMatches() {
    return this.http.get<any>(`${this.Api_Prediction}/predit/matches`);
  }

  CreateMatch(match: any) {
    return this.http.post<any>(`${this.Api_Prediction}/predit/matches`, match);
  }

  GetPredictions() {
    return this.http.get<any>(`${this.Api_Prediction}/predit/predictions`);
  }

  CreatePrediction(body: { homeTeamName: string, awayTeamName: string }) {
    return this.http.post<any>(`${this.Api_Prediction}/predit/predictions`, body);
  }
}
