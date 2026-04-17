import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Router } from '@angular/router';
import { register_userMoldel } from './register_user.model';
import { loginMoldel } from './login.model';
import { register_userConfigMoldel } from './registerUserConfig.model';
import { EquipoModel } from './equipo.model';

@Injectable({
  providedIn: 'root'
})
export class ConexionDBService {
  
  BASE_URL_SQL = 'http://localhost:3000'

  constructor(private http: HttpClient, private router: Router) { }

  RegistroUsuario(id: register_userMoldel ){
    return this.http.post<string>(`${this.BASE_URL_SQL}/cup/userResgiter`, id)
  }

   obtenerLogin(id: loginMoldel)  {
    return this.http.post<loginMoldel[]>(`${this.BASE_URL_SQL}/cup/UserAutenticar`, id);
  }

  // SECCION GESTION DE ROLES
  GetRoles() {
    return this.http.get<any[]>(`${this.BASE_URL_SQL}/cup/GetRoles`);
  }

  ActualizarRolUsuario(id: any) {
    return this.http.put(`${this.BASE_URL_SQL}/cup/UpdateRolUsuario`, id);
  }

  InactivarUsuario(id: any) {
    return this.http.put(`${this.BASE_URL_SQL}/cup/InactivarUsuario`, id);
  }


  // SECCION CONFIGURACION
  RegistroUsuarioConfig(id: register_userConfigMoldel){
    return this.http.post<string>(`${this.BASE_URL_SQL}/cup/ResgiterUserConfig`, id)
  }
  GerUserConfig(){
    return this.http.get<register_userConfigMoldel>(`${this.BASE_URL_SQL}/cup/GetUserConfig`)
  }
  actualizarUsuario(id: any) {
  return this.http.put(`${this.BASE_URL_SQL}/cup/UpdateUserConfig`, id);
  }

  // SECCION EQUIPOS
  GetEquipos() {
    return this.http.get<EquipoModel[]>(`${this.BASE_URL_SQL}/cup/GetEquipos`);
  }
  RegistrarEquipo(equipo: any) {
    return this.http.post<string>(`${this.BASE_URL_SQL}/cup/RegistrarEquipo`, equipo);
  }
  ActualizarEquipo(equipo: any) {
    return this.http.put(`${this.BASE_URL_SQL}/cup/ActualizarEquipo`, equipo);
  }
  EliminarEquipo(id: number) {
    return this.http.delete(`${this.BASE_URL_SQL}/cup/EliminarEquipo/${id}`);
  }

  // SECCION PARTIDOS
  GetPartidos() {
    return this.http.get<any[]>(`${this.BASE_URL_SQL}/cup/GetPartidos`);
  }
  GetEquiposLista() {
    return this.http.get<any[]>(`${this.BASE_URL_SQL}/cup/GetEquipos`);
  }
  RegistrarPartido(partido: any) {
    return this.http.post<string>(`${this.BASE_URL_SQL}/cup/RegistrarPartido`, partido);
  }
  ActualizarPartido(partido: any) {
    return this.http.put(`${this.BASE_URL_SQL}/cup/ActualizarPartido`, partido);
  }
  EliminarPartido(id: number) {
    return this.http.delete(`${this.BASE_URL_SQL}/cup/EliminarPartido/${id}`);
  }

  // SECCION RESULTADOS
  GetPartidosFinalizados() {
    return this.http.get<any[]>(`${this.BASE_URL_SQL}/cup/GetPartidosFinalizados`);
  }
  RegistrarResultado(resultado: any) {
    return this.http.put(`${this.BASE_URL_SQL}/cup/RegistrarResultado`, resultado);
  }
  GetTablaPosiciones() {
    return this.http.get<any[]>(`${this.BASE_URL_SQL}/cup/GetTablaPosiciones`);
  }
  GetLogAuditoria() {
    return this.http.get<any[]>(`${this.BASE_URL_SQL}/cup/GetLogAuditoria`);
  }
}
