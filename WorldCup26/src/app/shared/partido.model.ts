export interface PartidoModel {
  PartidoID?: number;
  EquipoLocalID: number;
  EquipoVisitanteID: number;
  FechaPartido: string;
  Estadio: string;
  Fase: string;
  GolesLocal?: number;
  GolesVisitante?: number;
  Estado_Juego: string;
  // Para mostrar nombres en la tabla
  NombreLocal?: string;
  NombreVisitante?: string;
}