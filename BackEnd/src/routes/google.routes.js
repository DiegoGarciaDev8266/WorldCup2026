const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuario.repository');
const auditoriaService = require('../services/auditoria.service');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token de Google requerido" });
    }

    // 1 — Verificar token con Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { name, email } = payload;

    // 2 — Buscar o crear usuario en BD
    const user = await usuarioRepository.buscarOCrearPorGoogle(name, email);

    if (user.ESTADO === 'INA') {
      return res.status(403).json({ message: "Usuario inactivo, acceso denegado" });
    }

    // 3 — Generar JWT propio
    const secretKey = process.env.SECRET_KEY;
    const jwtToken = jwt.sign(
      { id: user.ID, nombre: user.NOMBRE, rol: user.ROL },
      secretKey,
      { expiresIn: "2h" }
    );

    // 4 — Registrar en auditoría
    await auditoriaService.registrar(
      'LOGIN_GOOGLE', 'USUARIOS',
      `Inicio de sesión con Google: "${email}"`,
      name
    );

    res.json({
      message: "Login exitoso",
      token: jwtToken,
      user: { nombre: user.NOMBRE, rol: user.ROL },
      ok: true
    });

  } catch (error) {
    console.error('❌ Error en Google Auth:', error);
    res.status(401).json({ message: "Token de Google inválido" });
  }
});

module.exports = router;