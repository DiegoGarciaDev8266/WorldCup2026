<<<<<<< HEAD
import { Component, NgModule } from '@angular/core';
import { RouterLink, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Users/login/login.component';
import { RegisterUserComponent } from './Users/register-user/register-user.component';
import { StartComponent } from './Home/Menu/start.component';
import { DashboardComponent } from './Home/Dashboard/dashboard.component';
import { RegisterUserConfigComponent } from './Configuration/register-userConfig/register-userConfig.component';
import { GestionRolesComponent } from './Configuration/gestion-roles/gestion-roles.component';
import { GestionSeleccionesComponent } from './Configuration/gestion-selecciones/gestion-selecciones.component';
import { ProgramacionCalendarioComponent } from './Configuration/programacion-calendario/programacion-calendario.component';
import { RegistroResultadosComponent } from './Configuration/registro-resultados/registro-resultados.component';
import { TeamsComponent } from './Prediction/teams/teams.component';
import { TeamsStatisticsComponent } from './Prediction/teams-statistics/teams-statistics.component';
import { MatchesComponent } from './Prediction/matches/matches.component';
import { PredictionsComponent } from './Prediction/predictions/predictions.component';
=======
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterUserComponent } from './features/auth/components/register-user/register-user.component';
import { StartComponent } from './core/components/menu/start.component';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';
import { RegisterUserConfigComponent } from './features/configuration/components/register-user-config/register-userConfig.component';
import { GestionRolesComponent } from './features/configuration/components/gestion-roles/gestion-roles.component';
import { GestionSeleccionesComponent } from './features/configuration/components/gestion-selecciones/gestion-selecciones.component';
import { ProgramacionCalendarioComponent } from './features/configuration/components/programacion-calendario/programacion-calendario.component';
import { RegistroResultadosComponent } from './features/configuration/components/registro-resultados/registro-resultados.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { TablaPosicionesComponent } from './features/dashboard/components/tabla-posiciones/tabla-posiciones.component';
import { ConsultaPartidosComponent } from './features/dashboard/components/consulta-partidos/consulta-partidos.component';
import { EnVivoComponent } from './features/dashboard/components/en-vivo/en-vivo.component';

>>>>>>> origin/main

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
<<<<<<< HEAD
  {path : 'register-user', component: RegisterUserComponent},
  {path: 'start', component: StartComponent},
  {path: 'Dashboard', component: DashboardComponent},
  {path: 'Register_UserConfig', component: RegisterUserConfigComponent},
  {path: 'gestion-roles', component: GestionRolesComponent},
  {path: 'gestion-selecciones', component: GestionSeleccionesComponent},
  {path: 'programacion-calendario', component: ProgramacionCalendarioComponent},
  {path: 'registro-resultados', component: RegistroResultadosComponent},

  {path: 'Prediction_teams', component: TeamsComponent},
  {path: 'Prediction_teams-statistics', component: TeamsStatisticsComponent},
  {path: 'Matches', component: MatchesComponent},
  {path: 'predictions', component: PredictionsComponent}




=======
  { path: 'register-user', component: RegisterUserComponent },
  { path: 'start', component: StartComponent, canActivate: [AuthGuard] },
  { path: 'Dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'tabla-posiciones', component: TablaPosicionesComponent, canActivate: [AuthGuard] },
  { path: 'consulta-partidos', component: ConsultaPartidosComponent, canActivate: [AuthGuard] },
  { path: 'en-vivo', component: EnVivoComponent, canActivate: [AuthGuard] },
  // Rutas solo para admin
  { path: 'Register_UserConfig', component: RegisterUserConfigComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'gestion-roles', component: GestionRolesComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'gestion-selecciones', component: GestionSeleccionesComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'programacion-calendario', component: ProgramacionCalendarioComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'registro-resultados', component: RegistroResultadosComponent, canActivate: [AuthGuard, AdminGuard] },
>>>>>>> origin/main
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}