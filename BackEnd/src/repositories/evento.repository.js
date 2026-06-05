const { sql } = require('../config/db');

const eventoRepository = {

  async registrar(PartidoID, Minuto, TipoEvento, Equipo, Descripcion, EsLocal) {
    const request = new sql.Request();
    request.input('PartidoID', sql.Int, PartidoID);
    request.input('Minuto', sql.Int, Minuto);
    request.input('TipoEvento', sql.VarChar, TipoEvento);
    request.input('Equipo', sql.VarChar, Equipo || '');
    request.input('Descripcion', sql.VarChar, Descripcion || '');
    request.input('EsLocal', sql.Bit, EsLocal ? 1 : 0);
    await request.query(`
      INSERT INTO TBL_EVENTOS_PARTIDO
        (PartidoID, Minuto, TipoEvento, Equipo, Descripcion, EsLocal)
      VALUES
        (@PartidoID, @Minuto, @TipoEvento, @Equipo, @Descripcion, @EsLocal)
    `);
  },

  async obtenerPorPartido(PartidoID) {
    const request = new sql.Request();
    request.input('PartidoID', sql.Int, PartidoID);
    const result = await request.query(`
      SELECT EventoID, Minuto, TipoEvento, Equipo, Descripcion, EsLocal
      FROM TBL_EVENTOS_PARTIDO
      WHERE PartidoID = @PartidoID
      ORDER BY Minuto ASC
    `);
    return result.recordset;
  }
};

module.exports = eventoRepository;