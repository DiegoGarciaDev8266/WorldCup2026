
 const sql = require("mssql");

  //Crear un pool de conexiones para mejor rendimiento
 const conexion = {
     server: process.env.DB_HOST || "ASUSDF",
     database: process.env.DB_NAME || "NexusWorldCup26",
     user: process.env.DB_USER || "Diego_admin",
     password: process.env.DB_PASS || "Password123*",
     options: {
       encrypt: false,
       trustServerCertificate: true,
     },
   };
  
    //conexion global (pool interno)
   async function conectarDB() {
      try {
        await sql.connect(conexion);
        console.log("Conectado a SQL Server");
        return true;
      } catch (err) {
        console.error("Error de conexión", err);
        return false;
      }
    }
  
module.exports = {sql, conectarDB};


