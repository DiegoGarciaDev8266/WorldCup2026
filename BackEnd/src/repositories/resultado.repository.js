const { sql } = require('../config/db');

const resultadoRepository = {

  async actualizarGoles(PartidoID, GolesLocal, GolesVisitante, Estado_Juego) {
    const request = new sql.Request();
    request.input('PartidoID', sql.Int, PartidoID);
    request.input('GolesLocal', sql.Int, GolesLocal);
    request.input('GolesVisitante', sql.Int, GolesVisitante);
    request.input('Estado_Juego', sql.VarChar, Estado_Juego || 'Finalizado');
    await request.query(`
      UPDATE TBL_PARTIDOS
      SET GolesLocal = @GolesLocal,
          GolesVisitante = @GolesVisitante,
          Estado_Juego = @Estado_Juego
      WHERE PartidoID = @PartidoID
    `);
  },

  async existePosicion(equipoID) {
    const request = new sql.Request();
    request.input('EquipoID', sql.Int, equipoID);
    const result = await request.query(`
      SELECT PosicionID FROM TBL_POSICIONES WHERE EquipoID = @EquipoID
    `);
    return result.recordset.length > 0;
  },

  async insertarPosicion(equipoID, grupo, puntos, gf, gc, ganado, empatado, perdido) {
    const request = new sql.Request();
    request.input('EquipoID', sql.Int, equipoID);
    request.input('Grupo', sql.VarChar, grupo);
    request.input('Puntos', sql.Int, puntos);
    request.input('GolesAFavor', sql.Int, gf);
    request.input('GolesEnContra', sql.Int, gc);
    request.input('Ganados', sql.Int, ganado);
    request.input('Empatados', sql.Int, empatado);
    request.input('Perdidos', sql.Int, perdido);
    await request.query(`
      INSERT INTO TBL_POSICIONES 
        (EquipoID, Grupo, PartidosJugados, Ganados, Empatados, Perdidos,
         GolesAFavor, GolesEnContra, Puntos)
      VALUES 
        (@EquipoID, @Grupo, 1, @Ganados, @Empatados, @Perdidos,
         @GolesAFavor, @GolesEnContra, @Puntos)
    `);
  },

  async actualizarPosicion(equipoID, puntos, gf, gc, ganado, empatado, perdido) {
    const request = new sql.Request();
    request.input('EquipoID', sql.Int, equipoID);
    request.input('Puntos', sql.Int, puntos);
    request.input('GolesAFavor', sql.Int, gf);
    request.input('GolesEnContra', sql.Int, gc);
    request.input('Ganados', sql.Int, ganado);
    request.input('Empatados', sql.Int, empatado);
    request.input('Perdidos', sql.Int, perdido);
    await request.query(`
      UPDATE TBL_POSICIONES
      SET PartidosJugados = PartidosJugados + 1,
          Ganados = Ganados + @Ganados,
          Empatados = Empatados + @Empatados,
          Perdidos = Perdidos + @Perdidos,
          GolesAFavor = GolesAFavor + @GolesAFavor,
          GolesEnContra = GolesEnContra + @GolesEnContra,
          Puntos = Puntos + @Puntos
      WHERE EquipoID = @EquipoID
    `);
  },

  async obtenerPosiciones() {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT P.PosicionID, P.Grupo, P.PartidosJugados,
        P.Ganados, P.Empatados, P.Perdidos,
        P.GolesAFavor, P.GolesEnContra, P.Puntos,
        E.NombreEquipo, E.EscudoURL
      FROM TBL_POSICIONES P
      INNER JOIN TBL_EQUIPOS E ON P.EquipoID = E.EquipoID
      ORDER BY P.Grupo, P.Puntos DESC,
               (P.GolesAFavor - P.GolesEnContra) DESC
    `);
    return result.recordset;
  },

  async registrarAuditoria(PartidoID, GolesLocal, GolesVisitante, UsuarioAccion, TipoAccion, Modulo, Descripcion) {
  const request = new sql.Request();
  request.input('PartidoID', sql.Int, PartidoID || null);
  request.input('GolesLocal', sql.Int, GolesLocal || null);
  request.input('GolesVisitante', sql.Int, GolesVisitante || null);
  request.input('UsuarioAccion', sql.VarChar, UsuarioAccion || 'sistema');
  request.input('TipoAccion', sql.VarChar, TipoAccion);
  request.input('Modulo', sql.VarChar, Modulo || 'SISTEMA');
  request.input('Descripcion', sql.VarChar, Descripcion || '');
  await request.query(`
    INSERT INTO TBL_AUDITORIA 
      (PartidoID, GolesLocal, GolesVisitante, UsuarioAccion, TipoAccion, Modulo, Descripcion)
    VALUES 
      (@PartidoID, @GolesLocal, @GolesVisitante, @UsuarioAccion, @TipoAccion, @Modulo, @Descripcion)
  `);
},

async obtenerAuditoria() {
  const request = new sql.Request();
  const result = await request.query(`
    SELECT 
      A.AuditoriaID,
      A.GolesLocal,
      A.GolesVisitante,
      A.FechaAccion,
      A.UsuarioAccion,
      A.TipoAccion,
      A.Modulo,
      A.Descripcion,
      EL.NombreEquipo AS NombreLocal,
      EV.NombreEquipo AS NombreVisitante
    FROM TBL_AUDITORIA A
    LEFT JOIN TBL_PARTIDOS P ON A.PartidoID = P.PartidoID
    LEFT JOIN TBL_EQUIPOS EL ON P.EquipoLocalID = EL.EquipoID
    LEFT JOIN TBL_EQUIPOS EV ON P.EquipoVisitanteID = EV.EquipoID
    ORDER BY A.FechaAccion DESC
  `);
  return result.recordset;
}
};

module.exports = resultadoRepository;