
 require("dotenv").config(); // Cargar variables de entorno
 const { conectarDB } = require("./src/config/db");

conectarDB();
 //console.log("SECRET_KEY valor:", process.env.SECRET_KEY);
 //console.log("ENV:", process.env);
 const express = require("express");
 const bodyParser = require("body-parser");
 const cors = require("cors");
 const path = require("path");

 const app = express();
// const PUERTO = process.env.PORT || 3000 && NODE_ENV;
  const PUERTO = process.env.PORT || 3000;

 // Middleware
 app.use(cors({
   origin: process.env.NODE_ENV === "production" ? ["https://psaecng.com" , "https://www.psaecng.com"] : "http://localhost:4200",
   methods: ["GET", "POST", "PUT", "DELETE"],
   allowedHeaders: ["Content-Type", "Authorization"]
 }));
 app.use(bodyParser.json({ limit: "50mb" }));
 app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Servir archivos estáticos
 app.use("/uploads", express.static(path.join(__dirname, "uploads")));


 const routes = require("./src/routes/routes");
 app.use('/cup', routes);

  //Ruta principal
 app.get("/", (req, res) => res.send("API en funcionamiento 🚀"));

 // Iniciar servidor
 app.listen(PUERTO, () => {
   console.log(`🚀 Servidor corriendo en el puerto: ${PUERTO}`);
 });
