const mysql = require("mysql2");

// Crear un pool de conexiones para mejor rendimiento
const conexion = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST ,
    port:  parseInt(process.env.DB_PORT) ,
    database: process.env.DB_NAME1 ,
    user: process.env.DB_USER1  ,
    password: process.env.DB_PASS1 ,
  });
  
  conexion.getConnection((error, connection) => {
    if (error) {
      console.error("❌ Error al conectar a  MySql:", error);
      return;
    }
    console.log(" Conexión exitosa a MySql");
    connection.release();
  });
  
  module.exports = conexion;