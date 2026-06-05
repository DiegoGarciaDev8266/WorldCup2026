const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuario.repository');

// Singleton
const authService = {

  async encriptarContrasena(password) {
    if (!password) throw new Error("No se proporcionó una contraseña");
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  },

  async verificarContrasena(passwordIngresada, hashGuardado) {
    return await bcrypt.compare(passwordIngresada, hashGuardado);
  },

  async login(email, password) {
    const user = await usuarioRepository.buscarPorEmail(email);

    if (!user) throw { status: 401, message: "Usuario no encontrado" };
    if (user.ESTADO === 'INA') throw { status: 403, message: "Usuario inactivo, acceso denegado" };

    const coincide = await this.verificarContrasena(password, user.PASSWORD_HASH);
    if (!coincide) throw { status: 401, message: "Contraseña incorrecta" };

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) throw { status: 500, message: "SECRET_KEY no está definido" };

    // Fix: usar nombres correctos de columnas SQL Server
    const token = jwt.sign(
      { id: user.ID, nombre: user.NOMBRE, rol: user.ROL },
      secretKey,
      { expiresIn: "2h" }
    );

    return {
      token,
      user: { nombre: user.NOMBRE, rol: user.ROL }
    };
  },

  async registrarUsuario(nombre, email, password) {
    const hash = await this.encriptarContrasena(password);
    await usuarioRepository.crear(nombre, email, hash);
  },

  async registrarUsuarioConfig(Nombre, Email, Password, ROL) {
    const hash = await this.encriptarContrasena(Password);
    await usuarioRepository.crearConRol(Nombre, Email, hash, ROL);
  }
};

module.exports = authService;