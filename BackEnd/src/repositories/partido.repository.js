const { sql } = require('../config/db');

const partidoRepository = {

  async obtenerTodos() {
  const request = new sql.Request();
  const result = await request.query(`
    SELECT P.*,
      EL.NombreEquipo AS NombreLocal,
      EV.NombreEquipo AS NombreVisitante,
      EL.EscudoURL AS EscudoLocal,
      EV.EscudoURL AS EscudoVisitante
    FROM TBL_PARTIDOS P
    INNER JOIN TBL_EQUIPOS EL ON P.EquipoLocalID = EL.EquipoID
    INNER JOIN TBL_EQUIPOS EV ON P.EquipoVisitanteID = EV.EquipoID
    ORDER BY P.FechaPartido
  `);
  return result.recordset;
},

  async obtenerFinalizados() {
  const request = new sql.Request();
  const result = await request.query(`
    SELECT P.*,
      EL.NombreEquipo AS NombreLocal,
      EV.NombreEquipo AS NombreVisitante,
      EL.EscudoURL AS EscudoLocal,
      EV.EscudoURL AS EscudoVisitante
    FROM TBL_PARTIDOS P
    INNER JOIN TBL_EQUIPOS EL ON P.EquipoLocalID = EL.EquipoID
    INNER JOIN TBL_EQUIPOS EV ON P.EquipoVisitanteID = EV.EquipoID
    WHERE P.Estado_Juego = 'Finalizado'
    ORDER BY P.FechaPartido
  `);
  return result.recordset;
},

    async crear(EquipoLocalID, EquipoVisitanteID, FechaPartido, Estadio, Fase, Estado_Juego) {
    const request = new sql.Request();
    request.input('EquipoLocalID', sql.Int, EquipoLocalID);
    request.input('EquipoVisitanteID', sql.Int, EquipoVisitanteID);
    // Usar VarChar en lugar de DateTime para evitar conversión UTC
    request.input('FechaPartido', sql.VarChar, FechaPartido);
    request.input('Estadio', sql.VarChar, Estadio);
    request.input('Fase', sql.VarChar, Fase);
    request.input('Estado_Juego', sql.VarChar, Estado_Juego);
    await request.query(`
      INSERT INTO TBL_PARTIDOS 
        (EquipoLocalID, EquipoVisitanteID, FechaPartido, Estadio, Fase, Estado_Juego, GolesLocal, GolesVisitante)
      VALUES 
        (@EquipoLocalID, @EquipoVisitanteID, CONVERT(datetime, @FechaPartido, 120), 
        @Estadio, @Fase, @Estado_Juego, NULL, NULL)
    `);
  },

  async actualizar(PartidoID, EquipoLocalID, EquipoVisitanteID, FechaPartido, Estadio, Fase, Estado_Juego) {
    const request = new sql.Request();
    request.input('PartidoID', sql.Int, PartidoID);
    request.input('EquipoLocalID', sql.Int, EquipoLocalID);
    request.input('EquipoVisitanteID', sql.Int, EquipoVisitanteID);
    request.input('FechaPartido', sql.DateTime, FechaPartido);
    request.input('Estadio', sql.VarChar, Estadio || '');
    request.input('Fase', sql.VarChar, Fase);
    request.input('Estado_Juego', sql.VarChar, Estado_Juego || 'Programado');
    await request.query(`
      UPDATE TBL_PARTIDOS
      SET EquipoLocalID = @EquipoLocalID,
          EquipoVisitanteID = @EquipoVisitanteID,
          FechaPartido = @FechaPartido,
          Estadio = @Estadio, Fase = @Fase,
          Estado_Juego = @Estado_Juego
      WHERE PartidoID = @PartidoID
    `);
  },

  async eliminar(id) {
    const request = new sql.Request();
    request.input('PartidoID', sql.Int, id);
    await request.query(`DELETE FROM TBL_PARTIDOS WHERE PartidoID = @PartidoID`);
  },

  async obtenerInfoParaPosiciones(PartidoID) {
    const request = new sql.Request();
    request.input('PartidoID', sql.Int, PartidoID);
    const result = await request.query(`
      SELECT P.EquipoLocalID, P.EquipoVisitanteID,
        EL.Grupo AS GrupoLocal, EV.Grupo AS GrupoVisitante
      FROM TBL_PARTIDOS P
      INNER JOIN TBL_EQUIPOS EL ON P.EquipoLocalID = EL.EquipoID
      INNER JOIN TBL_EQUIPOS EV ON P.EquipoVisitanteID = EV.EquipoID
      WHERE P.PartidoID = @PartidoID
    `);
    return result.recordset[0];
  }
};

module.exports = partidoRepository;