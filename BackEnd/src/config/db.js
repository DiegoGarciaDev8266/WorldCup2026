
 const sql = require("mssql");

  //Crear un pool de conexiones para mejor rendimiento
 const conexion = {
     server: process.env.DB_SERVER ,
     database: process.env.DB_NAME ,
     user: process.env.DB_USER ,
     password: process.env.DB_PASS,
     options: {
       encrypt: false,
       trustServerCertificate: true,
     },
   };
  
    //conexion global (pool interno)
   async function conectarDB() {
     try {
       await sql.connect(conexion);
       console.log(" Conectado a sql server");
     }catch (err){
       console.error("error de conexion", err)
     }
   }
  
   module.exports = {sql, conectarDB};


