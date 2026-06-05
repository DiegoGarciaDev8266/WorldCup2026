const resultadoRepository = require('../repositories/resultado.repository');
const partidoRepository = require('../repositories/partido.repository');
const auditoriaService = require('./auditoria.service');

const FASES_ELIMINATORIAS = [
  'Dieciseisavos', 'Octavos', 'Cuartos',
  'Semifinal', 'Tercer puesto', 'Final'
];

const resultadoService = {

  async registrarResultado(
    PartidoID, GolesLocal, GolesVisitante,
    Estado_Juego, usuario = 'sistema',
    PenalesLocal = null, PenalesVisitante = null
  ) {
    await resultadoRepository.actualizarGoles(
      PartidoID, GolesLocal, GolesVisitante,
      Estado_Juego, PenalesLocal, PenalesVisitante
    );

    const partido = await partidoRepository.obtenerInfoParaPosiciones(PartidoID);
    const { EquipoLocalID, EquipoVisitanteID, GrupoLocal, Fase } = partido;

    // Solo actualizar posiciones en fase de grupos
    if (!FASES_ELIMINATORIAS.includes(Fase)) {
      let puntosLocal = 0, puntosVisitante = 0;
      let ganadoLocal = 0, ganadoVisitante = 0;
      let empatado = 0, perdidoLocal = 0, perdidoVisitante = 0;

      if (GolesLocal > GolesVisitante) {
        puntosLocal = 3; ganadoLocal = 1; perdidoVisitante = 1;
      } else if (GolesLocal < GolesVisitante) {
        puntosVisitante = 3; ganadoVisitante = 1; perdidoLocal = 1;
      } else {
        puntosLocal = 1; puntosVisitante = 1; empatado = 1;
      }

      await this._actualizarPosicion(
        EquipoLocalID, GrupoLocal, puntosLocal,
        GolesLocal, GolesVisitante, ganadoLocal, empatado, perdidoLocal
      );
      await this._actualizarPosicion(
        EquipoVisitanteID, GrupoLocal, puntosVisitante,
        GolesVisitante, GolesLocal, ganadoVisitante, empatado, perdidoVisitante
      );
    }

    const descripcionPenales = (PenalesLocal !== null && PenalesVisitante !== null)
      ? ` (Penales: ${PenalesLocal}-${PenalesVisitante})`
      : '';

    await auditoriaService.registrar(
      'REGISTRO_RESULTADO', 'RESULTADOS',
      `Registró resultado: ${GolesLocal} - ${GolesVisitante}${descripcionPenales}`,
      usuario,
      { PartidoID, GolesLocal, GolesVisitante }
    );
  },

  async _actualizarPosicion(equipoID, grupo, puntos, gf, gc, ganado, empatado, perdido) {
    const existe = await resultadoRepository.existePosicion(equipoID);
    if (!existe) {
      await resultadoRepository.insertarPosicion(equipoID, grupo, puntos, gf, gc, ganado, empatado, perdido);
    } else {
      await resultadoRepository.actualizarPosicion(equipoID, puntos, gf, gc, ganado, empatado, perdido);
    }
  },

  async obtenerPosiciones() {
    return await resultadoRepository.obtenerPosiciones();
  },

  async obtenerAuditoria() {
    return await resultadoRepository.obtenerAuditoria();
  }
};

module.exports = resultadoService;