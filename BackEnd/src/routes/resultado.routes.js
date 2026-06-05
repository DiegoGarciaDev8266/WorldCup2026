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
    res.json(await resultadoService.obtenerPosiciones());
  } catch (error) {
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