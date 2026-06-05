import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Auth
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterUserComponent } from './features/auth/components/register-user/register-user.component';

// Core
import { StartComponent } from './core/components/menu/start.component';

// Dashboard
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';
import { TablaPosicionesComponent } from './features/dashboard/components/tabla-posiciones/tabla-posiciones.component';
import { ConsultaPartidosComponent } from './features/dashboard/components/consulta-partidos/consulta-partidos.component';
import { EnVivoComponent } from './features/dashboard/components/en-vivo/en-vivo.component';

// Configuration
import { RegisterUserConfigComponent } from './features/configuration/components/register-user-config/register-userConfig.component';
import { GestionRolesComponent } from './features/configuration/components/gestion-roles/gestion-roles.component';
import { GestionSeleccionesComponent } from './features/configuration/components/gestion-selecciones/gestion-selecciones.component';
import { ProgramacionCalendarioComponent } from './features/configuration/components/programacion-calendario/programacion-calendario.component';
import { RegistroResultadosComponent } from './features/configuration/components/registro-resultados/registro-resultados.component';

// Prediction
import { TeamsComponent } from './Prediction/teams/teams.component';
import { TeamsStatisticsComponent } from './Prediction/teams-statistics/teams-statistics.component';
import { MatchesComponent } from './Prediction/matches/matches.component';
import { PredictionsComponent } from './Prediction/predictions/predictions.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterUserComponent,
    StartComponent,
    DashboardComponent,
    TablaPosicionesComponent,
    ConsultaPartidosComponent,
    EnVivoComponent,
    RegisterUserConfigComponent,
    GestionRolesComponent,
    GestionSeleccionesComponent,
    ProgramacionCalendarioComponent,
    RegistroResultadosComponent,
    TeamsComponent,
    TeamsStatisticsComponent,
    MatchesComponent,
    PredictionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgChartsModule,
    HttpClientModule,
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }