const express = require("express");
const router = express.Router();
const conexion = require("../config/db"); //conexión a la BD
const multer = require("multer");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const ok = require("assert");
//const storage = multer.memoryStorage(); // guarda img in memory
//const upload = multer({ storage: storage });
const path = require("path");
const upload = require('../middlewares/upload');
const sql = require("mssql"); // 



// async function encriptarContrasena(password_hash) {
//   const saltRounds = 10;
//   const hash = await bcrypt.hash(password_hash, saltRounds);
//   return hash;
// };

async function encriptarContrasena(password) {
  // Si password es undefined o null, lanzamos un error claro
  if (!password) {
    throw new Error("No se proporcionó una contraseña para encriptar");
  }

  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

async function verificarContrasena(passwordIngresada, hashGuardado) {
  const coincide = await bcrypt.compare(passwordIngresada, hashGuardado);
  return coincide;
};

// LOGIN 
router.post('/UserAutenticar', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({ message: "Email y password requeridos" });
    }

    // Query para SQL Server
    const request = new sql.Request();
    request.input('email', sql.VarChar, email);

    const result = await request.query(`
      SELECT * FROM TABLA_USUARIOS WHERE email = @email
    `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }
    // console.log("BODY:", req.body);
    // console.log("EMAIL:", email);
    // console.log("PASSWORD:", password);

    const user = result.recordset[0];
    console.log("USER DB:", user);
    // 
    const coincide = await verificarContrasena(password, user.PASSWORD_HASH);
    if (!coincide) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const secretKey = process.env.SECRET_KEY;
    console.log("SECRET_KEY:", process.env.SECRET_KEY);

    if (!secretKey) {
      return res.status(500).json({ message: "SECRET_KEY no está definido" });
    }

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, rol: user.rol },
      secretKey,
      { expiresIn: "2h" }
    );

    console.log("✅ Login exitoso");

    return res.json({
      message: "Login exitoso",
      token,
      user: { nombre: user.nombre, rol: user.rol },
      ok: true
    });

  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});
//module.exports = router;


function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  // Debe venir en formato: Bearer token
  if (!authHeader) {
    return res.status(403).json({ message: "No se proporcionó un token" });
  }

  const token = authHeader.split(' ')[1]; // separar "Bearer" y el token real

  if (!token) {
    return res.status(403).json({ message: "Token inválido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // verifica el token
    req.user = decoded; // guardamos la info del usuario en la request
    next(); // pasar a la siguiente función
  } catch (error) {
    return res.status(401).json({ message: "Token no válido o expirado" });
  }
}
module.exports = verifyToken;

// Regsitro de usuario
router.post("/userResgiter", async (req, res) => {
  try {
    // 1. Extraemos 'password' del JSON que envía el cliente
    const { nombre, email, password } = req.body;

    // Validación manual 
    if (!password) {
      return res.status(400).json({ error: "El campo 'password' es obligatorio en el JSON" });
    }

    // 2. Encriptamos la password
    const hash = await encriptarContrasena(password);

    // 3. Consulta para SQL Server (Sintaxis estándar)
    // Nota: SQL Server no soporta "SET ?" como MySQL
    const query = `
      INSERT INTO TABLA_USUARIOS (nombre, email, password_hash) 
      VALUES (@nombre, @email, @password_hash)
    `;

    // 4. Ejecución (Dependiendo de la librería, en este caso es: mssql)
    const request = new sql.Request();
    request.input('nombre', sql.VarChar, nombre);
    request.input('email', sql.VarChar, email);
    request.input('password_hash', sql.VarChar, hash); // Guardamos el HASH

    await request.query(query);

    res.json({ message: "Usuario registrado con éxito" });

  } catch (error) {
    console.error("Error en el proceso:", error);
    res.status(500).json({ message: "Error al procesar el registro" });
  }
  console.log(req.body);
});


////MODULO DE CONFIGURACION 

// Regsitro de usuario Configuracion
router.post("/ResgiterUserConfig", async (req, res) => {
  try {
    // 1. Extraemos 'password' del JSON que envía el cliente
    const { Nombre, Email, Password, ROL } = req.body;

    // Validación manual 
    if (!Nombre || !Email || !Password || !ROL) {
      return res.status(400).json({ error: "Todos los campos son obligatorio" });
    }

    // 2. Encriptamos la password
    const hash = await encriptarContrasena(Password);

    // 3. Consulta para SQL Server (Sintaxis estándar)
    // Nota: SQL Server no soporta "SET ?" como MySQL
    const query = `
      INSERT INTO TABLA_USUARIOS (Nombre, Email, Password_hash, ROL) 
      VALUES (@Nombre, @Email, @Password_hash, @ROL)
    `;

    // 4. Ejecución (Dependiendo de la librería, en este caso es: mssql)
    const request = new sql.Request();
    request.input('Nombre', sql.VarChar, Nombre);
    request.input('Email', sql.VarChar, Email);
    request.input('Password_hash', sql.VarChar, hash); // Guardamos el HASH
    request.input('ROL', sql.VarChar, ROL); // Guardamos el HASH


    await request.query(query);

    res.json({ message: "Usuario registrado con éxito" });

  } catch (error) {
    console.error("Error en el proceso:", error);
    res.status(500).json({ message: "Error al procesar el registro" });
  }
  console.log(req.body);
});


// mostrar usuarios Configuracion
router.get("/GetUserConfig", async (req, res) => {
  try {

    const query = `
    SELECT 
      US.ID, 
      US.Nombre, 
      US.Email, 
      R.Nombre_Rol AS Rol,
      US.FECHA_CREACION
    FROM TABLA_USUARIOS US 
    INNER JOIN TABLA_ROLES R 
      ON US.ROL = R.ID;`;

    const request = new sql.Request();

    const result = await request.query(query);

    // 🔥 IMPORTANTE: devolver datos
    res.json(result.recordset);

  } catch (error) {
    console.error("Error en el proceso:", error);
    res.status(500).json({ message: "Error al procesar" });
  }
});

router.put("/UpdateUserConfig", async (req, res) => {
  try {
    const { ID, Nombre, Email, Password, ROL } = req.body;

    if (!ROL) {
  return res.status(400).json({ message: "El rol es obligatorio" });
}
    let query = `
      UPDATE TABLA_USUARIOS
      SET Nombre = @Nombre,
          Email = @Email,
          ROL = @ROL
    `;

    const request = new sql.Request();

    request.input('ID', sql.Int, ID);
    request.input('Nombre', sql.VarChar, Nombre);
    request.input('Email', sql.VarChar, Email);
    request.input('ROL', sql.Int, ROL);

    // 🔥 SOLO si viene password
    if (Password && Password.trim() !== "") {
      const hash = await encriptarContrasena(Password);

      query += `, Password_Hash = @Password_Hash`;
      request.input('Password_Hash', sql.VarChar, hash);
    }

    query += ` WHERE ID = @ID`;

    await request.query(query);

    res.json({ message: "Usuario actualizado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar" });
  }
  //console.log(req.body);
});

module.exports = router;
