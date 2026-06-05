const { sql } = require('../config/db');

const estadisticaRepository = {

  async inicializarEstadisticas(PartidoID, EquipoLocalID, EquipoVisitanteID) {
    for (const EquipoID of [EquipoLocalID, EquipoVisitanteID]) {
      const request = new sql.Request();
      request.input('PartidoID', sql.Int, PartidoID);
      request.input('EquipoID', sql.Int, EquipoID);
      await request.query(`
        IF NOT EXISTS (
          SELECT 1 FROM TBL_ESTADISTICAS_PARTIDO
          WHERE PartidoID = @PartidoID AND EquipoID = @EquipoID
        )
        INSERT INTO TBL_ESTADISTICAS_PARTIDO (PartidoID, EquipoID)
        VALUES (@PartidoID, @EquipoID)
      `);
    }
  },

  async actualizarEstadistica(PartidoID, EquipoID, campo) {
    const camposPermitidos = [
      'Tiros', 'Atajadas', 'Faltas', 'TarjetasAmarillas',
      'TarjetasRojas', 'Corners', 'FueraDeJuego', 'Penaltis',
      'GolesAFavor', 'GolesEnContra', 'TirosAlArco', 'TirosFuera',
      'Offsides', 'Despejes', 'Intercepciones', 'GrandesOcasiones'
    ];
    if (!camposPermitidos.includes(campo)) return;

    const request = new sql.Request();
    request.input('PartidoID', sql.Int, PartidoID);
    request.input('EquipoID', sql.Int, EquipoID);
    await request.query(`
      UPDATE TBL_ESTADISTICAS_PARTIDO
      SET ${campo} = ${campo} + 1
      WHERE PartidoID = @PartidoID AND EquipoID = @EquipoID
    `);
  },

  async sumarDecimal(PartidoID, EquipoID, campo, valor) {
    const request = new sql.Request();
    request.input('PartidoID', sql.Int, PartidoID);
    request.input('EquipoID', sql.Int, EquipoID);
    request.input('Valor', sql.Decimal(4,2), valor);
    await request.query(`
      UPDATE TBL_ESTADISTICAS_PARTIDO
      SET ${campo} = ${campo} + @Valor
      WHERE PartidoID = @PartidoID AND EquipoID = @EquipoID
    `);
  },

  async calcularPosesion(PartidoID, EquipoLocalID, EquipoVisitanteID) {
    // Obtener tiros de cada equipo para calcular posesión
    const r1 = new sql.Request();
    r1.input('PartidoID', sql.Int, PartidoID);
    const result = await r1.query(`
      SELECT EquipoID, Tiros, Corners, Faltas
      FROM TBL_ESTADISTICAS_PARTIDO
      WHERE PartidoID = @PartidoID
    `);

    const local = result.recordset.find(r => r.EquipoID === EquipoLocalID);
    const visitante = result.recordset.find(r => r.EquipoID === EquipoVisitanteID);

    if (!local || !visitante) return;

    const totalLocal = (local.Tiros * 2) + local.Corners + local.Faltas;
    const totalVisitante = (visitante.Tiros * 2) + visitante.Corners + visitante.Faltas;
    const total = totalLocal + totalVisitante;

    if (total === 0) {
      // Si no hay actividad dividir 50/50
      await this._setPosesion(PartidoID, EquipoLocalID, 50);
      await this._setPosesion(PartidoID, EquipoVisitanteID, 50);
      return;
    }

    const posLocal = Math.round((totalLocal / total) * 100);
    const posVisitante = 100 - posLocal;

    await this._setPosesion(PartidoID, EquipoLocalID, posLocal);
    await this._setPosesion(PartidoID, EquipoVisitanteID, posVisitante);
  },

  async _setPosesion(PartidoID, EquipoID, valor) {
    const request = new sql.Request();
    request.input('PartidoID', sql.Int, PartidoID);
    request.input('EquipoID', sql.Int, EquipoID);
    request.input('Valor', sql.Int, valor);
    await request.query(`
      UPDATE TBL_ESTADISTICAS_PARTIDO
      SET Posesion = @Valor
      WHERE PartidoID = @PartidoID AND EquipoID = @EquipoID
    `);
  },

  async obtenerPorPartido(PartidoID) {
    const request = new sql.Request();
    request.input('PartidoID', sql.Int, PartidoID);
    const result = await request.query(`
      SELECT
        E.*,
        EQ.NombreEquipo,
        EQ.EscudoURL,
        P.EquipoLocalID
      FROM TBL_ESTADISTICAS_PARTIDO E
      INNER JOIN TBL_EQUIPOS EQ ON E.EquipoID = EQ.EquipoID
      INNER JOIN TBL_PARTIDOS P ON E.PartidoID = P.PartidoID
      WHERE E.PartidoID = @PartidoID
    `);
    return result.recordset;
  }
};

module.exports = estadisticaRepository;