const estadisticaRepository = require('../repositories/estadistica.repository');

const estadisticaService = {

  async inicializar(PartidoID, EquipoLocalID, EquipoVisitanteID) {
    await estadisticaRepository.inicializarEstadisticas(
      PartidoID, EquipoLocalID, EquipoVisitanteID
    );
  },

  async registrarEvento(PartidoID, EquipoID, EquipoRivalID, tipoEvento) {
    const mapaEventos = {
      'TIRO': [
        { equipo: EquipoID, campo: 'Tiros' },
        { equipo: EquipoID, campo: 'TirosFuera' },
        { equipo: EquipoID, campo: 'GolesEsperados', valor: 0.08 }
      ],
      'ATAJADA': [
        { equipo: EquipoRivalID, campo: 'Atajadas' },
        { equipo: EquipoRivalID, campo: 'TirosAlArco' },
        { equipo: EquipoRivalID, campo: 'Despejes' }
      ],
      'FALTA': [
        { equipo: EquipoID, campo: 'Faltas' },
        { equipo: EquipoRivalID, campo: 'Intercepciones' }
      ],
      'TARJETA_AMARILLA': [
        { equipo: EquipoID, campo: 'TarjetasAmarillas' }
      ],
      'TARJETA_ROJA': [
        { equipo: EquipoID, campo: 'TarjetasRojas' }
      ],
      'CORNER': [
        { equipo: EquipoID, campo: 'Corners' },
        { equipo: EquipoID, campo: 'GolesEsperados', valor: 0.05 }
      ],
      'FUERA_DE_JUEGO': [
        { equipo: EquipoID, campo: 'FueraDeJuego' },
        { equipo: EquipoID, campo: 'Offsides' }
      ],
      'PENALTI': [
        { equipo: EquipoID, campo: 'Penaltis' },
        { equipo: EquipoID, campo: 'GrandesOcasiones' },
        { equipo: EquipoID, campo: 'GolesEsperados', valor: 0.76 }
      ],
      'GOL': [
        { equipo: EquipoID, campo: 'GolesAFavor' },
        { equipo: EquipoRivalID, campo: 'GolesEnContra' },
        { equipo: EquipoID, campo: 'TirosAlArco' },
        { equipo: EquipoID, campo: 'GrandesOcasiones' },
        { equipo: EquipoID, campo: 'GolesEsperados', valor: 0.08 }
      ],
    };

    const acciones = mapaEventos[tipoEvento];
    if (!acciones) return;

    for (const accion of acciones) {
      if (accion.valor) {
        await estadisticaRepository.sumarDecimal(
          PartidoID, accion.equipo, accion.campo, accion.valor
        );
      } else {
        await estadisticaRepository.actualizarEstadistica(
          PartidoID, accion.equipo, accion.campo
        );
      }
    }
  },

  async calcularPosesion(PartidoID, EquipoLocalID, EquipoVisitanteID) {
    await estadisticaRepository.calcularPosesion(
      PartidoID, EquipoLocalID, EquipoVisitanteID
    );
  },

  async obtenerPorPartido(PartidoID) {
    return await estadisticaRepository.obtenerPorPartido(PartidoID);
  }
};

module.exports = estadisticaService;