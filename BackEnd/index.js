require("dotenv").config();
const { conectarDB } = require("./src/config/db");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PUERTO = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://psaecng.com", "https://www.psaecng.com"]
    : "http://localhost:4200",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas
const routes = require("./src/routes/routes.index");
app.use('/cup', routes);

// Ruta principal
app.get("/", (req, res) => res.send("API en funcionamiento 🚀"));

// Iniciar servidor y BD
conectarDB().then(() => {
  // Iniciar scheduler después de conectar a la BD
  const schedulerService = require("./src/services/scheduler.service");
  schedulerService.iniciar();

  app.listen(PUERTO, () => {
    console.log(`🚀 Servidor corriendo en el puerto: ${PUERTO}`);
  });
}).catch(err => {
  console.error("❌ Error al conectar a la BD:", err);
});