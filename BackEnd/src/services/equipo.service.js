const equipoRepository = require('../repositories/equipo.repository');
const auditoriaService = require('./auditoria.service');

const equipoService = {

  async obtenerTodos() {
    return await equipoRepository.obtenerTodos();
  },

  async crear(NombreEquipo, EscudoURL, Grupo, Estado, usuario = 'sistema') {
    if (!NombreEquipo || !Grupo) {
      throw { status: 400, message: "NombreEquipo y Grupo son requeridos" };
    }
    await equipoRepository.crear(NombreEquipo, EscudoURL, Grupo, Estado);
    await auditoriaService.registrar(
      'REGISTRO', 'EQUIPOS',
      `Registró equipo "${NombreEquipo}" en Grupo ${Grupo}`,
      usuario
    );
  },

    async actualizar(EquipoID, NombreEquipo, EscudoURL, Grupo, Estado, usuario = 'sistema') {
      await equipoRepository.actualizar(EquipoID, NombreEquipo, EscudoURL, Grupo, Estado);
      await auditoriaService.registrar(
        'ACTUALIZACIÓN', 'EQUIPOS',
        `Actualizó equipo "${NombreEquipo}" — Grupo ${Grupo}`,
        usuario
      );
    },
    async eliminar(id, usuario = 'sistema') {
      await equipoRepository.eliminar(id);
      await auditoriaService.registrar(
        'ELIMINACIÓN', 'EQUIPOS',
        `Eliminó un equipo de la plataforma`,
        usuario
      );
    }
};

module.exports = equipoService;