import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './Users/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterUserComponent } from './Users/register-user/register-user.component';
import { StartComponent } from './Home/Menu/start.component';

import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './Home/Dashboard/dashboard.component';
import { RegisterUserConfigComponent } from './Configuration/register-userConfig/register-userConfig.component';
import { GestionRolesComponent } from './Configuration/gestion-roles/gestion-roles.component';
import { GestionSeleccionesComponent } from './Configuration/gestion-selecciones/gestion-selecciones.component';
import { ProgramacionCalendarioComponent } from './Configuration/programacion-calendario/programacion-calendario.component';
import { RegistroResultadosComponent } from './Configuration/registro-resultados/registro-resultados.component';
import { CommonModule } from '@angular/common';
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
    NgChartsModule,
    HttpClientModule,
    CommonModule,
    BrowserAnimationsModule, // Requerido
    ToastrModule.forRoot(), // Configuración global
    FormsModule 
    
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
