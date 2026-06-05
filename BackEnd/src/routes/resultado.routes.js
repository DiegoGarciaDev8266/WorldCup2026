const express = require('express');
const router = express.Router();
const resultadoService = require('../services/resultado.service');

router.put('/RegistrarResultado', async (req, res) => {
  try {
    const { PartidoID, GolesLocal, GolesVisitante, Estado_Juego } = req.body;
    const usuario = req.user?.nombre || 'sistema';
    await resultadoService.registrarResultado(PartidoID, GolesLocal, GolesVisitante, Estado_Juego, usuario);
    res.json({ message: "Resultado registrado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar resultado" });
  }
});

router.get('/GetTablaPosiciones', async (req, res) => {
  try {
    const { sql } = require('../config/db');
    const request = new sql.Request();
    const result = await request.query(`
      SELECT 
        E.EquipoID,
        E.NombreEquipo,
        E.EscudoURL,
        E.Grupo,
        ISNULL(P.PartidosJugados, 0) AS PartidosJugados,
        ISNULL(P.Ganados, 0)         AS Ganados,
        ISNULL(P.Empatados, 0)       AS Empatados,
        ISNULL(P.Perdidos, 0)        AS Perdidos,
        ISNULL(P.GolesAFavor, 0)     AS GolesAFavor,
        ISNULL(P.GolesEnContra, 0)   AS GolesEnContra,
        ISNULL(P.Puntos, 0)          AS Puntos
      FROM TBL_EQUIPOS E
      LEFT JOIN TBL_POSICIONES P ON E.EquipoID = P.EquipoID
      WHERE E.Estado = 'ACT'
      ORDER BY E.Grupo, ISNULL(P.Puntos, 0) DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error GetTablaPosiciones:', error);
    res.status(500).json({ message: "Error al obtener tabla de posiciones" });
  }
});

router.get('/GetLogAuditoria', async (req, res) => {
  try {
    res.json(await resultadoService.obtenerAuditoria());
  } catch (error) {
    res.status(500).json({ message: "Error al obtener auditoría" });
  }
});

module.exports = router;