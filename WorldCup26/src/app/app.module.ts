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

import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterUserComponent } from './features/auth/components/register-user/register-user.component';
import { StartComponent } from './core/components/menu/start.component';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';
import { RegisterUserConfigComponent } from './features/configuration/components/register-user-config/register-userConfig.component';
import { GestionRolesComponent } from './features/configuration/components/gestion-roles/gestion-roles.component';
import { GestionSeleccionesComponent } from './features/configuration/components/gestion-selecciones/gestion-selecciones.component';
import { ProgramacionCalendarioComponent } from './features/configuration/components/programacion-calendario/programacion-calendario.component';
import { RegistroResultadosComponent } from './features/configuration/components/registro-resultados/registro-resultados.component';
import { TablaPosicionesComponent } from './features/dashboard/components/tabla-posiciones/tabla-posiciones.component';
import { ConsultaPartidosComponent } from './features/dashboard/components/consulta-partidos/consulta-partidos.component';
import { EnVivoComponent } from './features/dashboard/components/en-vivo/en-vivo.component';
import { PrediccionPartidoComponent } from './features/predicciones/components/prediccion-partido/prediccion-partido.component';
import { PrediccionCampeonComponent } from './features/predicciones/components/prediccion-campeon/prediccion-campeon.component';
import { PrediccionHistorialComponent } from './features/predicciones/components/prediccion-historial/prediccion-historial.component';
import { SocketService } from './core/services/socket.service';

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
    TablaPosicionesComponent,
    ConsultaPartidosComponent,
    EnVivoComponent,
    PrediccionPartidoComponent,
    PrediccionCampeonComponent,
    PrediccionHistorialComponent
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
  providers: [
    SocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }