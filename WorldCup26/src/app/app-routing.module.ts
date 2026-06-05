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
import { PrediccionPartidoComponent } from './features/predicciones/components/prediccion-partido/prediccion-partido.component';
import { PrediccionCampeonComponent } from './features/predicciones/components/prediccion-campeon/prediccion-campeon.component';
import { PrediccionHistorialComponent } from './features/predicciones/components/prediccion-historial/prediccion-historial.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register-user', component: RegisterUserComponent },
  { path: 'start', component: StartComponent, canActivate: [AuthGuard] },
  { path: 'Dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'tabla-posiciones', component: TablaPosicionesComponent, canActivate: [AuthGuard] },
  { path: 'consulta-partidos', component: ConsultaPartidosComponent, canActivate: [AuthGuard] },
  { path: 'en-vivo', component: EnVivoComponent, canActivate: [AuthGuard] },
  { path: 'prediccion-partido', component: PrediccionPartidoComponent, canActivate: [AuthGuard] },
  { path: 'prediccion-campeon', component: PrediccionCampeonComponent, canActivate: [AuthGuard] },
  { path: 'prediccion-historial', component: PrediccionHistorialComponent, canActivate: [AuthGuard] },
  // Rutas solo para admin
  { path: 'Register_UserConfig', component: RegisterUserConfigComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'gestion-roles', component: GestionRolesComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'gestion-selecciones', component: GestionSeleccionesComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'programacion-calendario', component: ProgramacionCalendarioComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'registro-resultados', component: RegistroResultadosComponent, canActivate: [AuthGuard, AdminGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}