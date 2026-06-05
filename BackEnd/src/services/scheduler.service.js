const cron = require('node-cron');
const { sql } = require('../config/db');
const auditoriaService = require('./auditoria.service');
const estadisticaService = require('./estadistica.service');

const schedulerService = {

  iniciar() {
    console.log(' Scheduler iniciado');
    cron.schedule('* * * * *', async () => {
      await this.verificarPartidosParaIniciar();
    });
  },

    async verificarPartidosParaIniciar() {
    try {
      const request = new sql.Request();
      const result = await request.query(`
        SELECT P.PartidoID, P.EquipoLocalID, P.EquipoVisitanteID,
              P.FechaPartido, GETDATE() AS AhoraDB,
              EL.NombreEquipo AS NombreLocal,
              EV.NombreEquipo AS NombreVisitante
        FROM TBL_PARTIDOS P
        INNER JOIN TBL_EQUIPOS EL ON P.EquipoLocalID = EL.EquipoID
        INNER JOIN TBL_EQUIPOS EV ON P.EquipoVisitanteID = EV.EquipoID
        WHERE P.Estado_Juego = 'Programado'
        AND P.FechaPartido <= GETDATE()
      `);

      console.log(` Partidos para iniciar: ${result.recordset.length}`);
      for (const partido of result.recordset) {
        await this.iniciarPartido(partido);
      }

    } catch (error) {
      console.error(' Error en scheduler:', error);
    }
  },

  async iniciarPartido(partido) {
    try {
      const request = new sql.Request();
      request.input('PartidoID', sql.Int, partido.PartidoID);
      await request.query(`
        UPDATE TBL_PARTIDOS 
        SET Estado_Juego = 'En curso',
            GolesLocal = 0,
            GolesVisitante = 0
        WHERE PartidoID = @PartidoID
      `);

      // Inicializar estadísticas
      await estadisticaService.inicializar(
        partido.PartidoID,
        partido.EquipoLocalID,
        partido.EquipoVisitanteID
      );

      await auditoriaService.registrar(
        'INICIO_PARTIDO', 'PARTIDOS',
        `Partido iniciado: ${partido.NombreLocal} vs ${partido.NombreVisitante}`,
        'sistema'
      );

      console.log(` Partido iniciado: ${partido.NombreLocal} vs ${partido.NombreVisitante}`);

    } catch (error) {
      console.error(' Error iniciando partido:', error);
    }
  }
};

module.exports = schedulerService;