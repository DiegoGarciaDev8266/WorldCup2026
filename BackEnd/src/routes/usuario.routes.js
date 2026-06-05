const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const usuarioService = require('../services/usuario.service');

router.post('/ResgiterUserConfig', async (req, res) => {
  try {
    const { Nombre, Email, Password, ROL } = req.body;
    if (!Nombre || !Email || !Password || !ROL) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
    await authService.registrarUsuarioConfig(Nombre, Email, Password, ROL);
    const auditoriaService = require('../services/auditoria.service');
    await auditoriaService.registrar(
      'REGISTRO', 'USUARIOS',
      `Registró usuario "${Nombre}" con email "${Email}"`,
      'admin'
    );
    res.json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error al registrar" });
  }
});

router.get('/GetUserConfig', async (req, res) => {
  try {
    const data = await usuarioService.obtenerTodos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

router.put('/UpdateUserConfig', async (req, res) => {
  try {
    const { ID, Nombre, Email, Password, ROL } = req.body;
    const usuario = req.user?.nombre || 'sistema';
    if (!ROL) return res.status(400).json({ message: "El rol es obligatorio" });
    await usuarioService.actualizar(ID, Nombre, Email, Password, ROL, usuario);
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error al actualizar" });
  }
});

router.get('/GetRoles', async (req, res) => {
  try {
    const data = await usuarioService.obtenerConRoles();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener roles" });
  }
});

router.put('/UpdateRolUsuario', async (req, res) => {
  try {
    const { EMAIL, NOMBRE_ROL, ESTADO } = req.body;
    const usuario = req.user?.nombre || 'sistema';
    if (!EMAIL || !NOMBRE_ROL) {
      return res.status(400).json({ message: "EMAIL y NOMBRE_ROL son requeridos" });
    }
    await usuarioService.actualizarRol(EMAIL, NOMBRE_ROL, ESTADO, usuario);
    res.json({ message: "Rol actualizado correctamente" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error al actualizar rol" });
  }
});

router.put('/InactivarUsuario', async (req, res) => {
  try {
    const { EMAIL } = req.body;
    const usuario = req.user?.nombre || 'sistema';
    if (!EMAIL) return res.status(400).json({ message: "EMAIL es requerido" });
    await usuarioService.inactivar(EMAIL, usuario);
    res.json({ message: "Usuario inactivado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al inactivar usuario" });
  }
});

router.delete('/EliminarUsuario/:id', async (req, res) => {
  try {
    const usuario = req.user?.nombre || 'sistema';
    await usuarioService.eliminar(req.params.id, usuario);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
});

module.exports = router;