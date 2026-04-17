export interface EquipoModel {
  EquipoID?: number;
  NombreEquipo: string;
  EscudoURL: string;
  Grupo: string;
  Estado: string; // 'ACT' | 'INA'
}