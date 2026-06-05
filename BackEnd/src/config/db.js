
 const sql = require("mssql");

  //Crear un pool de conexiones para mejor rendimiento
 const conexion = {
<<<<<<< HEAD
     server: process.env.DB_SERVER ,
     database: process.env.DB_NAME ,
     user: process.env.DB_USER ,
     password: process.env.DB_PASS,
=======
     server: process.env.DB_HOST || "ASUSDF",
     database: process.env.DB_NAME || "NexusWorldCup26",
     user: process.env.DB_USER || "Diego_admin",
     password: process.env.DB_PASS || "Password123*",
>>>>>>> origin/main
     options: {
       encrypt: false,
       trustServerCertificate: true,
     },
   };
  
    //conexion global (pool interno)
   async function conectarDB() {
<<<<<<< HEAD
     try {
       await sql.connect(conexion);
       console.log(" Conectado a sql server");
     }catch (err){
       console.error("error de conexion", err)
     }
   }
=======
      try {
        await sql.connect(conexion);
        console.log("Conectado a SQL Server");
        return true;
      } catch (err) {
        console.error("Error de conexión", err);
        return false;
      }
    }
>>>>>>> origin/main
  
module.exports = {sql, conectarDB};


