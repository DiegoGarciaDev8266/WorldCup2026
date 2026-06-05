const express = require('express');
const router = express.Router();
const equipoService = require('../services/equipo.service');

router.get('/GetEquipos', async (req, res) => {
  try {
    res.json(await equipoService.obtenerTodos());
  } catch (error) {
    res.status(500).json({ message: "Error al obtener equipos" });
  }
});

router.post('/RegistrarEquipo', async (req, res) => {
  try {
    const { NombreEquipo, EscudoURL, Grupo, Estado } = req.body;
    const usuario = req.user?.nombre || 'sistema';
    await equipoService.crear(NombreEquipo, EscudoURL, Grupo, Estado, usuario);
    res.json({ message: "Equipo registrado correctamente" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error al registrar equipo" });
  }
});

router.put('/ActualizarEquipo', async (req, res) => {
  try {
    const { EquipoID, NombreEquipo, EscudoURL, Grupo, Estado } = req.body;
    const usuario = req.user?.nombre || 'sistema';
    await equipoService.actualizar(EquipoID, NombreEquipo, EscudoURL, Grupo, Estado, usuario);
    res.json({ message: "Equipo actualizado correctamente" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error al actualizar equipo" });
  }
});

router.delete('/EliminarEquipo/:id', async (req, res) => {
  try {
    const usuario = req.user?.nombre || 'sistema';
    await equipoService.eliminar(req.params.id, usuario);
    res.json({ message: "Equipo eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar equipo" });
  }
});

module.exports = router;