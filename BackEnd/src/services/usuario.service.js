const usuarioRepository = require('../repositories/usuario.repository');
const authService = require('./auth.service');
const auditoriaService = require('./auditoria.service');

const usuarioService = {

  async obtenerTodos() {
    return await usuarioRepository.obtenerTodos();
  },

  async obtenerConRoles() {
    return await usuarioRepository.obtenerConRoles();
  },

  async actualizar(ID, Nombre, Email, Password, ROL, usuario = 'sistema') {
    let hash = null;
    if (Password && Password.trim() !== "") {
      hash = await authService.encriptarContrasena(Password);
    }
    await usuarioRepository.actualizar(ID, Nombre, Email, ROL, hash);
    await auditoriaService.registrar(
      'ACTUALIZACIÓN', 'USUARIOS',
      `Actualizó usuario "${Nombre}" — "${Email}"`,
      usuario
    );
  },

  async actualizarRol(EMAIL, NOMBRE_ROL, ESTADO, usuario = 'sistema') {
    const rol = await usuarioRepository.buscarRolPorNombre(NOMBRE_ROL);
    if (!rol) throw { status: 404, message: "Rol no encontrado" };
    await usuarioRepository.actualizarRol(EMAIL, rol.ID, ESTADO);
    await auditoriaService.registrar(
      'ACTUALIZACIÓN', 'ROLES',
      `Cambió rol de "${EMAIL}" a "${NOMBRE_ROL}" — Estado: ${ESTADO}`,
      usuario
    );
  },

    async inactivar(EMAIL, usuario = 'sistema') {
      await usuarioRepository.inactivar(EMAIL);
      await auditoriaService.registrar(
        'INACTIVACIÓN', 'USUARIOS',
        `Inactivó usuario "${EMAIL}"`,
        usuario
      );
    },

    async eliminar(ID, usuario = 'sistema') {
    await usuarioRepository.eliminar(ID);
    await auditoriaService.registrar(
      'ELIMINACIÓN', 'USUARIOS',
      `Eliminó usuario de la plataforma`,
      usuario
    );
  }
};

module.exports = usuarioService;