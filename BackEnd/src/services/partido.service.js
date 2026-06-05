const partidoRepository = require('../repositories/partido.repository');
const auditoriaService = require('./auditoria.service');

const partidoService = {

  async obtenerTodos() {
    return await partidoRepository.obtenerTodos();
  },

  async obtenerFinalizados() {
    return await partidoRepository.obtenerFinalizados();
  },

  async crear(data, usuario = 'sistema') {
    const { EquipoLocalID, EquipoVisitanteID, FechaPartido, Estadio, Fase, Estado_Juego } = data;
    if (!EquipoLocalID || !EquipoVisitanteID || !FechaPartido || !Fase) {
      throw { status: 400, message: "Todos los campos son requeridos" };
    }
    if (EquipoLocalID === EquipoVisitanteID) {
      throw { status: 400, message: "El equipo local y visitante no pueden ser el mismo" };
    }
    await partidoRepository.crear(EquipoLocalID, EquipoVisitanteID, FechaPartido, Estadio, Fase, Estado_Juego);
    await auditoriaService.registrar(
      'REGISTRO', 'PARTIDOS',
      `Programó partido en ${Estadio || 'estadio pendiente'} — Fase: ${Fase}`,
      usuario
    );
  },

    async actualizar(data, usuario = 'sistema') {
    const { PartidoID } = data;
    if (!PartidoID) throw { status: 400, message: "PartidoID es requerido" };
    await partidoRepository.actualizar(
      data.PartidoID, data.EquipoLocalID, data.EquipoVisitanteID,
      data.FechaPartido, data.Estadio, data.Fase, data.Estado_Juego
    );
    await auditoriaService.registrar(
      'ACTUALIZACIÓN', 'PARTIDOS',
      `Actualizó partido — Fase: ${data.Fase} — Estadio: ${data.Estadio || 'pendiente'}`,
      usuario
    );
  },

    async eliminar(id, usuario = 'sistema') {
    await partidoRepository.eliminar(id);
    await auditoriaService.registrar(
      'ELIMINACIÓN', 'PARTIDOS',
      `Eliminó un partido de la plataforma`,
      usuario
    );
  }
};

module.exports = partidoService;