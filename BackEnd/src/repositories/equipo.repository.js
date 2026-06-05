const { sql } = require('../config/db');

const equipoRepository = {

  async obtenerTodos() {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT EquipoID, NombreEquipo, EscudoURL, Grupo, Estado
      FROM TBL_EQUIPOS
      ORDER BY Grupo, NombreEquipo
    `);
    return result.recordset;
  },

  async crear(NombreEquipo, EscudoURL, Grupo, Estado) {
    const request = new sql.Request();
    request.input('NombreEquipo', sql.VarChar, NombreEquipo);
    request.input('EscudoURL', sql.VarChar, EscudoURL || '');
    request.input('Grupo', sql.VarChar, Grupo);
    request.input('Estado', sql.VarChar, Estado || 'ACT');
    await request.query(`
      INSERT INTO TBL_EQUIPOS (NombreEquipo, EscudoURL, Grupo, Estado)
      VALUES (@NombreEquipo, @EscudoURL, @Grupo, @Estado)
    `);
  },

  async actualizar(EquipoID, NombreEquipo, EscudoURL, Grupo, Estado) {
    const request = new sql.Request();
    request.input('EquipoID', sql.Int, EquipoID);
    request.input('NombreEquipo', sql.VarChar, NombreEquipo);
    request.input('EscudoURL', sql.VarChar, EscudoURL || '');
    request.input('Grupo', sql.VarChar, Grupo);
    request.input('Estado', sql.VarChar, Estado || 'ACT');
    await request.query(`
      UPDATE TBL_EQUIPOS
      SET NombreEquipo = @NombreEquipo, EscudoURL = @EscudoURL,
          Grupo = @Grupo, Estado = @Estado
      WHERE EquipoID = @EquipoID
    `);
  },

  async eliminar(id) {
    const request = new sql.Request();
    request.input('EquipoID', sql.Int, id);
    await request.query(`DELETE FROM TBL_EQUIPOS WHERE EquipoID = @EquipoID`);
  }
};

module.exports = equipoRepository;