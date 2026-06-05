const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const usuarioRoutes = require('./usuario.routes');
const equipoRoutes = require('./equipo.routes');
const partidoRoutes = require('./partido.routes');
const resultadoRoutes = require('./resultado.routes');
const googleRoutes = require('./google.routes');
const simulacionRoutes = require('./simulacion.routes');
const estadisticaRoutes = require('./estadistica.routes');

router.use('/', authRoutes);
router.use('/', usuarioRoutes);
router.use('/', equipoRoutes);
router.use('/', partidoRoutes);
router.use('/', resultadoRoutes);
router.use('/auth', googleRoutes);
router.use('/', simulacionRoutes);
router.use('/', estadisticaRoutes);

module.exports = router;