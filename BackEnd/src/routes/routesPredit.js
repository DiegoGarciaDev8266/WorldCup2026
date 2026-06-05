const express = require("express");
const router = express.Router();
const conexion = require("../config/Mysql2_db"); //conexión a la BD
const multer = require("multer");
const ok = require("assert");
//const storage = multer.memoryStorage(); // guarda img in memory
//const upload = multer({ storage: storage });
const path = require("path");
const upload = require('../middlewares/upload');
const Mysql = require("mysql2"); 

const axios = require("axios");

const SPRING_API = "http://localhost:8080";

router.get("/teams", (req, res) => {

  const query = "SELECT * FROM teams";
  conexion.query(query, (error, resultado) => {
    if (error) {
      console.error(error.message);
      return res.status(500).json({ error: "Error al obtener los equipos" });
    }
    res.json(resultado.length ? resultado : "No hay registros ");
  });
});



router.get("/statistics/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Petición estadísticas ID:", id);

  try {
    const response = await axios.get(`${SPRING_API}/api/statistics/${id}`);
    console.log("Respuesta Spring:", response.data);
    return res.json(response.data);
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "Error al obtener estadisticas" });
  }
});

// GET todos los matches
router.get("/matches", async (req, res) => {
  console.log("Petición GET matches");
  try {
    const response = await axios.get(`${SPRING_API}/api/matches`);
    console.log("Matches obtenidos");
    return res.json(response.data);
  } catch (error) {
    console.error(" Error:", error.message);
    return res.status(500).json({ error: "Error al obtener matches" });
  }
});

// POST crear match
router.post("/matches", async (req, res) => {
  console.log(" Petición POST match:", req.body);
  try {
    const response = await axios.post(`${SPRING_API}/api/matches`, req.body);
    console.log(" Match creado");
    return res.json(response.data);
  } catch (error) {
    console.error(" Error:", error.message);
    return res.status(500).json({ error: "Error al crear match" });
  }
});


// GET todas las predicciones
router.get("/predictions", async (req, res) => {
  console.log(" Petición GET predictions");
  try {
    const response = await axios.get(`${SPRING_API}/api/predictions`);
    return res.json(response.data);
  } catch (error) {
    console.error(" Error:", error.message);
    return res.status(500).json({ error: "Error al obtener predicciones" });
  }
});

// POST crear predicción
router.post("/predictions", async (req, res) => {
  console.log(" Petición POST prediction:", req.body);
  try {
    const response = await axios.post(`${SPRING_API}/api/predictions`, req.body);
    return res.json(response.data);
  } catch (error) {
    console.error(" Error:", error.message);
    return res.status(500).json({ error: "Error al crear predicción" });
  }
});

module.exports = router;
