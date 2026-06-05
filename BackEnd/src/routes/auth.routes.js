const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');

router.post('/UserAutenticar', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email y password requeridos" });
    }
    const result = await authService.login(email, password);
    res.json({ message: "Login exitoso", ...result, ok: true });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error en el servidor" });
  }
});

router.post('/userResgiter', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!password) return res.status(400).json({ error: "Password es obligatorio" });
    await authService.registrarUsuario(nombre, email, password);
    const auditoriaService = require('../services/auditoria.service');
    await auditoriaService.registrar(
      'REGISTRO', 'USUARIOS',
      `Nuevo usuario registrado: "${nombre}" — "${email}"`,
      'publico'
    );
    res.json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error al registrar" });
  }
});

module.exports = router;