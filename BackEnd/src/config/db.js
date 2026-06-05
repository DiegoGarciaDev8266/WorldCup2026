const sql = require("mssql");

const conexion = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function conectarDB() {
  try {
    await sql.connect(conexion);
    console.log(" Conectado a SQL Server");
    return true;
  } catch (err) {
    console.error(" Error de conexión", err);
    return false;
  }
}

module.exports = { sql, conectarDB };