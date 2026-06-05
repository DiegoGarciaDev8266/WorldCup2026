const express = require('express');
const router = express.Router();
const estadisticaService = require('../services/estadistica.service');
const eventoRepository = require('../repositories/evento.repository');

const TIPOS_EVENTOS = [
  { tipo: 'NADA',             probabilidad: 0.45 },
  { tipo: 'TIRO',             probabilidad: 0.18 },
  { tipo: 'FALTA',            probabilidad: 0.12 },
  { tipo: 'ATAJADA',          probabilidad: 0.08 },
  { tipo: 'FUERA_DE_JUEGO',   probabilidad: 0.05 },
  { tipo: 'CORNER',           probabilidad: 0.04 },
  { tipo: 'SUSTITUCION',      probabilidad: 0.04 },
  { tipo: 'TARJETA_AMARILLA', probabilidad: 0.02 },
  { tipo: 'GOL',              probabilidad: 0.05 },
  { tipo: 'PENALTI',          probabilidad: 0.005 },
  { tipo: 'TARJETA_ROJA',     probabilidad: 0.005 },
];

const DESCRIPCIONES = {
  TIRO: [
    'Disparo desde fuera del área que sale desviado',
    'Remate de cabeza que va por encima del travesaño',
    'Tiro al arco que el portero despeja con dificultad',
    'Disparo cruzado que sale rozando el poste',
    'Volea desde la frontal del área que se va alta',
    'Remate de media vuelta que sale fuera por poco',
  ],
  FALTA: [
    'Falta táctica en el centro del campo',
    'Falta peligrosa cerca del área rival',
    'Infracción al jugador en velocidad',
    'Falta por entrada dura por detrás',
    'El árbitro para el juego por falta en el mediocampo',
  ],
  ATAJADA: [
    'Gran atajada del portero bajo los tres palos',
    'El portero despeja el balón en dos tiempos',
    'Salvada espectacular del guardameta',
    'El portero atrapa el balón con seguridad',
    'Atajada con los pies del portero en mano a mano',
  ],
  SUSTITUCION: [
    'Cambio táctico del entrenador',
    'Sustitución por posible lesión muscular',
    'Cambio para refrescar el mediocampo',
    'El entrenador apuesta por un delantero más',
  ],
  TARJETA_AMARILLA: [
    'Amonestación por protestar al árbitro',
    'Tarjeta amarilla por falta reiterada',
    'Amonestación por entrada dura',
    'Amarilla por pérdida de tiempo deliberada',
  ],
  GOL: [
    'Golazo de zurda al ángulo superior',
    'Remate de cabeza tras centro al área',
    'Disparo raso que besa el poste y entra',
    'Definición clara mano a mano con el portero',
    'Tiro libre directo que se cuela por la escuadra',
    'Gol en propia puerta tras un centro peligroso',
  ],
  PENALTI: [
    'Penalti por mano dentro del área tras disparo',
    'El árbitro señala el punto de penal por derribo',
    'Penalti polémico por falta dentro del área',
    'Penal cobrado tras revisión del VAR',
  ],
  TARJETA_ROJA: [
    'Expulsión por doble amarilla',
    'Roja directa por falta violenta sobre el rival',
    'Expulsión por insultos graves al árbitro',
    'Roja por última oportunidad de gol frustrada',
  ],
  FUERA_DE_JUEGO: [
    'El asistente levanta el banderín por posición adelantada',
    'Gol anulado por fuera de juego milimétrico',
    'Jugada interrumpida por offside en el área',
    'El VAR confirma el fuera de juego',
  ],
  CORNER: [
    'Córner tras remate desviado por la defensa',
    'Saque de esquina que genera peligro en el área',
    'Córner botado al primer palo que nadie remata',
    'Centro al área desde el córner que despeja el portero',
  ],
};

function seleccionarEvento(minuto, golesLocal, golesVisitante) {
  let tipos = [...TIPOS_EVENTOS];

  if (minuto >= 80) {
    const diferencia = Math.abs(golesLocal - golesVisitante);
    if (diferencia > 0) {
      tipos = tipos.map(t =>
        t.tipo === 'GOL' ? { ...t, probabilidad: 0.06 } :
        t.tipo === 'NADA' ? { ...t, probabilidad: 0.35 } : t
      );
    }
  }

  if (minuto < 45) {
    tipos = tipos.map(t =>
      t.tipo === 'SUSTITUCION' ? { ...t, probabilidad: 0.005 } : t
    );
  }

  const random = Math.random();
  let acumulado = 0;
  for (const evento of tipos) {
    acumulado += evento.probabilidad;
    if (random <= acumulado) return evento.tipo;
  }
  return 'NADA';
}

function seleccionarEquipos(esLocal, equipoLocalID, equipoVisitanteID,
                             nombreLocal, nombreVisitante) {
  return {
    equipo: esLocal ? nombreLocal : nombreVisitante,
    equipoID: esLocal ? equipoLocalID : equipoVisitanteID,
    equipoRivalID: esLocal ? equipoVisitanteID : equipoLocalID,
    esLocal
  };
}

function seleccionarDescripcion(tipo) {
  const lista = DESCRIPCIONES[tipo] || ['Evento del partido'];
  return lista[Math.floor(Math.random() * lista.length)];
}

// Inicializar estadísticas cuando inicia el partido
router.post('/InicializarEstadisticas', async (req, res) => {
  try {
    const { PartidoID, EquipoLocalID, EquipoVisitanteID } = req.body;
    await estadisticaService.inicializar(PartidoID, EquipoLocalID, EquipoVisitanteID);
    res.json({ message: "Estadísticas inicializadas" });
  } catch (error) {
    console.error('❌ Error InicializarEstadisticas:', error);
    res.status(500).json({ message: "Error al inicializar estadísticas" });
  }
});

router.post('/GenerarEvento', async (req, res) => {
  try {
    const {
      nombreLocal, nombreVisitante, minuto,
      golesLocal, golesVisitante,
      partidoID, equipoLocalID, equipoVisitanteID
    } = req.body;

    let tipo = seleccionarEvento(minuto, golesLocal, golesVisitante);

    if (tipo === 'TARJETA_ROJA' && minuto < 20) tipo = 'FALTA';
    if (tipo === 'GOL' && minuto < 3) tipo = 'TIRO';
    if (tipo === 'NADA') return res.json({ tipo: 'NADA' });

    const esLocal = Math.random() < 0.5;
    const { equipo, equipoID, equipoRivalID } = seleccionarEquipos(
      esLocal, equipoLocalID, equipoVisitanteID, nombreLocal, nombreVisitante
    );
    const descripcion = seleccionarDescripcion(tipo);

    // Registrar estadística en BD
    if (partidoID && equipoID) {
      await estadisticaService.registrarEvento(
        partidoID, equipoID, equipoRivalID, tipo
      );
    }

    // Guardar evento en BD
    if (partidoID) {
      await eventoRepository.registrar(
        partidoID, minuto, tipo,
        equipo, descripcion, esLocal
      );
    }

    res.json({ tipo, equipo, esLocal, descripcion });

  } catch (error) {
    console.error('❌ Error GenerarEvento:', error);
    res.status(500).json({ message: "Error al generar evento" });
  }
});

module.exports = router;