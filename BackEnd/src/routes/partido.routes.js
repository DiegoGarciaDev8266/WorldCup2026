const express = require('express');
const router = express.Router();
const partidoService = require('../services/partido.service');
const { sql } = require('../config/db'); // ← mover aquí arriba

router.get('/GetPartidos', async (req, res) => {
  try {
    res.json(await partidoService.obtenerTodos());
  } catch (error) {
    res.status(500).json({ message: "Error al obtener partidos" });
  }
});

router.get('/GetPartidosFinalizados', async (req, res) => {
  try {
    res.json(await partidoService.obtenerFinalizados());
  } catch (error) {
    res.status(500).json({ message: "Error al obtener partidos finalizados" });
  }
});

router.get('/GetPartidosEnVivo', async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT 
        P.PartidoID, P.EquipoLocalID, P.EquipoVisitanteID,
        P.FechaPartido, P.Estadio, P.Fase,
        P.GolesLocal, P.GolesVisitante, P.Estado_Juego,
        EL.NombreEquipo AS NombreLocal,
        EV.NombreEquipo AS NombreVisitante,
        EL.EscudoURL AS EscudoLocal,
        EV.EscudoURL AS EscudoVisitante
      FROM TBL_PARTIDOS P
      INNER JOIN TBL_EQUIPOS EL ON P.EquipoLocalID = EL.EquipoID
      INNER JOIN TBL_EQUIPOS EV ON P.EquipoVisitanteID = EV.EquipoID
      WHERE P.Estado_Juego = 'En curso'
      ORDER BY P.FechaPartido
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Error GetPartidosEnVivo:', error);
    res.status(500).json({ message: "Error al obtener partidos en vivo" });
  }
});

router.post('/RegistrarPartido', async (req, res) => {
  try {
    const usuario = req.user?.nombre || 'sistema';
    await partidoService.crear(req.body, usuario);
    res.json({ message: "Partido registrado correctamente" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error al registrar partido" });
  }
});

router.put('/ActualizarPartido', async (req, res) => {
  try {
    const usuario = req.user?.nombre || 'sistema';
    await partidoService.actualizar(req.body, usuario);
    res.json({ message: "Partido actualizado correctamente" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error al actualizar partido" });
  }
});

router.delete('/EliminarPartido/:id', async (req, res) => {
  try {
    const usuario = req.user?.nombre || 'sistema';
    await partidoService.eliminar(req.params.id, usuario);
    res.json({ message: "Partido eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar partido" });
  }
});

router.put('/ActualizarMarcadorVivo', async (req, res) => {
  try {
    const { PartidoID, GolesLocal, GolesVisitante } = req.body;
    const request = new sql.Request();
    request.input('PartidoID', sql.Int, PartidoID);
    request.input('GolesLocal', sql.Int, GolesLocal);
    request.input('GolesVisitante', sql.Int, GolesVisitante);
    await request.query(`
      UPDATE TBL_PARTIDOS
      SET GolesLocal = @GolesLocal, GolesVisitante = @GolesVisitante
      WHERE PartidoID = @PartidoID
    `);
    res.json({ message: "Marcador actualizado" });
  } catch (error) {
    console.error('❌ Error ActualizarMarcadorVivo:', error);
    res.status(500).json({ message: "Error al actualizar marcador" });
  }
});

router.put('/FinalizarPartido', async (req, res) => {
  try {
    const { PartidoID, GolesLocal, GolesVisitante } = req.body;
    const usuario = req.user?.nombre || 'sistema';

    const resultadoService = require('../services/resultado.service');
    await resultadoService.registrarResultado(
      PartidoID, GolesLocal, GolesVisitante, 'Finalizado', usuario
    );

    // Calcular posesión al finalizar
    const { sql } = require('../config/db');
    const reqPartido = new sql.Request();
    reqPartido.input('PartidoID', sql.Int, PartidoID);
    const partidoResult = await reqPartido.query(`
      SELECT EquipoLocalID, EquipoVisitanteID
      FROM TBL_PARTIDOS WHERE PartidoID = @PartidoID
    `);

    if (partidoResult.recordset.length > 0) {
      const { EquipoLocalID, EquipoVisitanteID } = partidoResult.recordset[0];
      const estadisticaService = require('../services/estadistica.service');
      await estadisticaService.calcularPosesion(
        PartidoID, EquipoLocalID, EquipoVisitanteID
      );
    }

    const auditoriaService = require('../services/auditoria.service');
    await auditoriaService.registrar(
      'FIN_PARTIDO', 'PARTIDOS',
      `Partido finalizado: ${GolesLocal} - ${GolesVisitante}`,
      'sistema'
    );

    res.json({ message: "Partido finalizado correctamente" });
  } catch (error) {
    console.error('❌ Error FinalizarPartido:', error);
    res.status(500).json({ message: "Error al finalizar partido" });
  }
});

module.exports = router;