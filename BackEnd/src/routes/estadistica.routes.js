const express = require('express');
const router = express.Router();
const estadisticaService = require('../services/estadistica.service');
const eventoRepository = require('../repositories/evento.repository');

router.get('/GetEstadisticas/:partidoId', async (req, res) => {
  try {
    const data = await estadisticaService.obtenerPorPartido(req.params.partidoId);
    res.json(data);
  } catch (error) {
    console.error('❌ Error GetEstadisticas:', error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
});

router.post('/RegistrarEventoEstadistica', async (req, res) => {
  try {
    const { PartidoID, EquipoID, EquipoRivalID, tipoEvento } = req.body;
    await estadisticaService.registrarEvento(PartidoID, EquipoID, EquipoRivalID, tipoEvento);
    res.json({ message: "Estadística actualizada" });
  } catch (error) {
    console.error('❌ Error RegistrarEventoEstadistica:', error);
    res.status(500).json({ message: "Error al registrar estadística" });
  }
});


router.get('/GetEventosPartido/:partidoId', async (req, res) => {
  try {
    const data = await eventoRepository.obtenerPorPartido(req.params.partidoId);
    res.json(data);
  } catch (error) {
    console.error('❌ Error GetEventosPartido:', error);
    res.status(500).json({ message: "Error al obtener eventos" });
  }
});

module.exports = router;