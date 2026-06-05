require("dotenv").config();
const { conectarDB } = require("./src/config/db");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const PUERTO = process.env.PORT || 3000;

// Configurar Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? ["https://psaecng.com", "https://www.psaecng.com"]
      : ["http://localhost:4200", "http://localhost:3350", "http://localhost:8080"],
    methods: ["GET", "POST"]
  }
});

// Exportar io para usarlo en otros archivos
module.exports.io = io;

// Eventos de conexión
io.on("connection", (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://psaecng.com", "https://www.psaecng.com"]
    : ["http://localhost:4200", "http://localhost:3350", "http://localhost:8080"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas SQL Server
const routes = require("./src/routes/routes.index");
app.use('/cup', routes);

// Rutas predicciones Spring Boot
const routesPredit = require("./src/routes/routesPredit");
app.use('/predit', routesPredit);

app.get("/", (req, res) => res.send("API en funcionamiento "));

conectarDB().then(() => {
  const schedulerService = require("./src/services/scheduler.service");
  schedulerService.iniciar();

  server.listen(PUERTO, () => {
    console.log(`Servidor corriendo en el puerto: ${PUERTO}`);
  });
}).catch(err => {
  console.error("Error al conectar a la BD:", err);
});