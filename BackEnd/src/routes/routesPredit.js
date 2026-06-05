const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const auditoriaService = require("../services/auditoria.service");

const SPRING_API = "http://localhost:8080";

function extraerUsuario(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return "anonimo";
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return decoded.nombre || decoded.email || String(decoded.id) || "usuario";
  } catch {
    return "anonimo";
  }
}

// Equipos

router.get("/teams", async (req, res) => {
  try {
    const response = await axios.get(`${SPRING_API}/api/teams`);
    return res.json(response.data);
  } catch (error) {
    console.error("Error GET teams:", error.message);
    return res.status(500).json({ error: "Error al obtener equipos" });
  }
});

router.post("/teams", async (req, res) => {
  try {
    const response = await axios.post(`${SPRING_API}/api/teams`, req.body);
    return res.json(response.data);
  } catch (error) {
    console.error("Error POST teams:", error.message);
    return res.status(500).json({ error: "Error al crear equipo" });
  }
});

// Estadisticas

router.get("/statistics/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`${SPRING_API}/api/statistics/${id}`);
    return res.json(response.data);
  } catch (error) {
    console.error("❌ Error GET statistics:", error.message);
    return res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// Partidos

router.get("/matches", async (req, res) => {
  try {
    const response = await axios.get(`${SPRING_API}/api/matches`);
    return res.json(response.data);
  } catch (error) {
    console.error("Error GET matches:", error.message);
    return res.status(500).json({ error: "Error al obtener partidos" });
  }
});

router.post("/matches", async (req, res) => {
  try {
    const response = await axios.post(`${SPRING_API}/api/matches`, req.body);
    return res.json(response.data);
  } catch (error) {
    console.error("Error POST matches:", error.message);
    return res.status(500).json({ error: "Error al crear partido" });
  }
});

// Predicciones
// POST predecir ganador de partido
router.post("/predictions", async (req, res) => {
  try {
    const usuario = extraerUsuario(req);
    const { homeTeamName, awayTeamName } = req.body;

    const response = await axios.post(
      `${SPRING_API}/api/predictions`,
      req.body,
      { headers: { "X-Usuario": usuario } }
    );

    await auditoriaService.registrar(
      "PREDICCION_PARTIDO",
      "PREDICCIONES",
      `Predicción solicitada: ${homeTeamName} vs ${awayTeamName}`,
      usuario
    );

    return res.json(response.data);
  } catch (error) {
    console.error("Error POST predictions:", error.message);
    return res.status(500).json({ error: "Error al crear predicción" });
  }
});

// GET historial — filtra por usuario
router.get("/predictions", async (req, res) => {
  try {
    const usuario = extraerUsuario(req);
    const response = await axios.get(`${SPRING_API}/api/predictions`, {
      headers: { "X-Usuario": usuario }
    });
    return res.json(response.data);
  } catch (error) {
    console.error("Error GET predictions:", error.message);
    return res.status(500).json({ error: "Error al obtener predicciones" });
  }
});

// POST predecir campeón del torneo
router.post("/predictions/tournament", async (req, res) => {
  try {
    const usuario = extraerUsuario(req);
    const equipos = Array.isArray(req.body) ? req.body : [];

    const response = await axios.post(
      `${SPRING_API}/api/predictions/tournament`,
      req.body,
      { headers: { "X-Usuario": usuario } }
    );

    await auditoriaService.registrar(
      "PREDICCION_TORNEO",
      "PREDICCIONES",
      `Predicción de campeón solicitada con ${equipos.length} equipos`,
      usuario
    );

    return res.json(response.data);
  } catch (error) {
    console.error("Error POST predictions/tournament:", error.message);
    return res.status(500).json({ error: "Error al predecir campeón" });
  }
});

// GET historial torneo — filtra por usuario
router.get("/predictions/tournament", async (req, res) => {
  try {
    const usuario = extraerUsuario(req);
    const response = await axios.get(
      `${SPRING_API}/api/predictions/tournament`,
      { headers: { "X-Usuario": usuario } }
    );
    return res.json(response.data);
  } catch (error) {
    console.error("Error GET predictions/tournament:", error.message);
    return res.status(500).json({ error: "Error al obtener predicciones de torneo" });
  }
});

module.exports = router;