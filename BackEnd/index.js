
require("dotenv").config(); // Cargar variables de entorno

const { conectarDB } = require("./src/config/db");
const { conectarMySql } = require("./src/config/Mysql2_db");

conectarDB();
//conectarMySql();
//console.log("SECRET_KEY valor:", process.env.SECRET_KEY);
//console.log("ENV:", process.env);
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
//const appPrediction = express();
// const PUERTO = process.env.PORT || 3000 && NODE_ENV;
const PUERTO = process.env.PORT || 3000;
const PUERTOMySql = process.env.PORT1 || 3306;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? ["https://psaecng.com", "https://www.psaecng.com"] : ["http://localhost:4200", "http://localhost:3350 ,http://localhost:8080"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const routes = require("./src/routes/routes");
const routesPredit  = require("./src/routes/routesPredit");

app.use('/cup', routes);

app.use('/predit', routesPredit);


//Ruta principal
app.get("/", (req, res) => res.send("API en funcionamiento 🚀"));

// Iniciar servidor sql
app.listen(PUERTO, () => {
  console.log(`Servidor SqlServer corriendo en el puerto: ${PUERTO}`);
});


// Iniciar servidor mysql
app.listen(PUERTOMySql, () => {
  console.log(`Servidor Mysql corriendo en el puerto: ${PUERTOMySql}`);
});