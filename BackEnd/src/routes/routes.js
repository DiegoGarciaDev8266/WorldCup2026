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
    
    if (user.ESTADO === 'INA') {
      return res.status(403).json({ message: "Usuario inactivo, acceso denegado" });
    }

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

//Obtener el rol
router.get("/GetRoles", async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT 
        U.ID,
        U.NOMBRE,
        U.EMAIL,
        R.NOMBRE_ROL,
        U.DESCRIPCION,
        U.FECHA_CREACION,
        U.ESTADO,
        R.USUARIO_CREACION
      FROM TABLA_USUARIOS U
      INNER JOIN TABLA_ROLES R ON U.ROL = R.ID
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al obtener roles" });
  }
});

// GESTIÓN DE ROLES - Actualizar rol de usuario
router.put("/UpdateRolUsuario", async (req, res) => {
  try {
    const { EMAIL, NOMBRE_ROL, DESCRIPCION, ESTADO } = req.body;

    if (!EMAIL || !NOMBRE_ROL) {
      return res.status(400).json({ message: "EMAIL y NOMBRE_ROL son requeridos" });
    }

    // Buscar ID del rol por nombre
    const requestRol = new sql.Request();
    requestRol.input('NOMBRE_ROL', sql.VarChar, NOMBRE_ROL);
    const rolResult = await requestRol.query(`
      SELECT ID FROM TABLA_ROLES WHERE NOMBRE_ROL = @NOMBRE_ROL
    `);

    if (rolResult.recordset.length === 0) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    const rolID = rolResult.recordset[0].ID;

    // Actualizar en TABLA_USUARIOS
    const request = new sql.Request();
    request.input('EMAIL', sql.VarChar, EMAIL);
    request.input('ROL', sql.Int, rolID);
    request.input('ESTADO', sql.VarChar, ESTADO || 'ACT');
    request.input('DESCRIPCION', sql.VarChar, DESCRIPCION || '');

    await request.query(`
      UPDATE TABLA_USUARIOS 
      SET ROL = @ROL,
          ESTADO = @ESTADO,
          DESCRIPCION = @DESCRIPCION
      WHERE EMAIL = @EMAIL
    `);

    res.json({ message: "Rol actualizado correctamente" });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al actualizar rol" });
  }
});

//Inactivar el usuario
router.put("/InactivarUsuario", async (req, res) => {
  try {
    const { EMAIL } = req.body;

    if (!EMAIL) {
      return res.status(400).json({ message: "EMAIL es requerido" });
    }

    const request = new sql.Request();
    request.input('EMAIL', sql.VarChar, EMAIL);

    await request.query(`
      UPDATE TABLA_USUARIOS 
      SET ESTADO = 'INA'
      WHERE EMAIL = @EMAIL
    `);

    res.json({ message: "Usuario inactivado correctamente" });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al inactivar usuario" });
  }
});

//Get de Selecciones
router.get("/GetEquipos", async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT 
        EquipoID,
        NombreEquipo,
        EscudoURL,
        Grupo,
        Estado
      FROM TBL_EQUIPOS
      ORDER BY Grupo, NombreEquipo
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al obtener equipos" });
  }
});

//POST registrar equipo
router.post("/RegistrarEquipo", async (req, res) => {
  try {
    const { NombreEquipo, EscudoURL, Grupo, Estado } = req.body;

    if (!NombreEquipo || !Grupo) {
      return res.status(400).json({ message: "NombreEquipo y Grupo son requeridos" });
    }

    const request = new sql.Request();
    request.input('NombreEquipo', sql.VarChar, NombreEquipo);
    request.input('EscudoURL', sql.VarChar, EscudoURL || '');
    request.input('Grupo', sql.VarChar, Grupo);
    request.input('Estado', sql.VarChar, Estado || 'ACT');

    await request.query(`
      INSERT INTO TBL_EQUIPOS (NombreEquipo, EscudoURL, Grupo, Estado)
      VALUES (@NombreEquipo, @EscudoURL, @Grupo, @Estado)
    `);

    res.json({ message: "Equipo registrado correctamente" });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al registrar equipo" });
  }
});

//PUT actualizar equipo
router.put("/ActualizarEquipo", async (req, res) => {
  try {
    const { EquipoID, NombreEquipo, EscudoURL, Grupo, Estado } = req.body;

    if (!EquipoID || !NombreEquipo || !Grupo) {
      return res.status(400).json({ message: "EquipoID, NombreEquipo y Grupo son requeridos" });
    }

    const request = new sql.Request();
    request.input('EquipoID', sql.Int, EquipoID);
    request.input('NombreEquipo', sql.VarChar, NombreEquipo);
    request.input('EscudoURL', sql.VarChar, EscudoURL || '');
    request.input('Grupo', sql.VarChar, Grupo);
    request.input('Estado', sql.VarChar, Estado || 'ACT');

    await request.query(`
      UPDATE TBL_EQUIPOS
      SET NombreEquipo = @NombreEquipo,
          EscudoURL = @EscudoURL,
          Grupo = @Grupo,
          Estado = @Estado
      WHERE EquipoID = @EquipoID
    `);

    res.json({ message: "Equipo actualizado correctamente" });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al actualizar equipo" });
  }
});

//DELETE eliminar equipo
router.delete("/EliminarEquipo/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID es requerido" });
    }

    const request = new sql.Request();
    request.input('EquipoID', sql.Int, id);

    await request.query(`
      DELETE FROM TBL_EQUIPOS WHERE EquipoID = @EquipoID
    `);

    res.json({ message: "Equipo eliminado correctamente" });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al eliminar equipo" });
  }
});

//GET partidos
router.get("/GetPartidos", async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT 
        P.PartidoID,
        P.EquipoLocalID,
        P.EquipoVisitanteID,
        P.FechaPartido,
        P.Estadio,
        P.Fase,
        P.GolesLocal,
        P.GolesVisitante,
        P.Estado_Juego,
        EL.NombreEquipo AS NombreLocal,
        EV.NombreEquipo AS NombreVisitante
      FROM TBL_PARTIDOS P
      INNER JOIN TBL_EQUIPOS EL ON P.EquipoLocalID = EL.EquipoID
      INNER JOIN TBL_EQUIPOS EV ON P.EquipoVisitanteID = EV.EquipoID
      ORDER BY P.FechaPartido
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al obtener partidos" });
  }
});

//POST Registrarpartidos
router.post("/RegistrarPartido", async (req, res) => {
  try {
    const { 
      EquipoLocalID, EquipoVisitanteID, 
      FechaPartido, Estadio, Fase, Estado_Juego 
    } = req.body;

    if (!EquipoLocalID || !EquipoVisitanteID || !FechaPartido || !Fase) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    if (EquipoLocalID === EquipoVisitanteID) {
      return res.status(400).json({ message: "El equipo local y visitante no pueden ser el mismo" });
    }

    const request = new sql.Request();
    request.input('EquipoLocalID', sql.Int, EquipoLocalID);
    request.input('EquipoVisitanteID', sql.Int, EquipoVisitanteID);
    request.input('FechaPartido', sql.DateTime, FechaPartido);
    request.input('Estadio', sql.VarChar, Estadio || '');
    request.input('Fase', sql.VarChar, Fase);
    request.input('Estado_Juego', sql.VarChar, Estado_Juego || 'Programado');

    await request.query(`
      INSERT INTO TBL_PARTIDOS 
        (EquipoLocalID, EquipoVisitanteID, FechaPartido, Estadio, Fase, Estado_Juego)
      VALUES 
        (@EquipoLocalID, @EquipoVisitanteID, @FechaPartido, @Estadio, @Fase, @Estado_Juego)
    `);

    res.json({ message: "Partido registrado correctamente" });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al registrar partido" });
  }
});

//PUT ActualizarPartido
router.put("/ActualizarPartido", async (req, res) => {
  try {
    const { 
      PartidoID, EquipoLocalID, EquipoVisitanteID,
      FechaPartido, Estadio, Fase, Estado_Juego 
    } = req.body;

    if (!PartidoID) {
      return res.status(400).json({ message: "PartidoID es requerido" });
    }

    const request = new sql.Request();
    request.input('PartidoID', sql.Int, PartidoID);
    request.input('EquipoLocalID', sql.Int, EquipoLocalID);
    request.input('EquipoVisitanteID', sql.Int, EquipoVisitanteID);
    request.input('FechaPartido', sql.DateTime, FechaPartido);
    request.input('Estadio', sql.VarChar, Estadio || '');
    request.input('Fase', sql.VarChar, Fase);
    request.input('Estado_Juego', sql.VarChar, Estado_Juego || 'Programado');

    await request.query(`
      UPDATE TBL_PARTIDOS
      SET EquipoLocalID = @EquipoLocalID,
          EquipoVisitanteID = @EquipoVisitanteID,
          FechaPartido = @FechaPartido,
          Estadio = @Estadio,
          Fase = @Fase,
          Estado_Juego = @Estado_Juego
      WHERE PartidoID = @PartidoID
    `);

    res.json({ message: "Partido actualizado correctamente" });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al actualizar partido" });
  }
});

//DELETE EliminarPartido
router.delete("/EliminarPartido/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const request = new sql.Request();
    request.input('PartidoID', sql.Int, id);

    await request.query(`
      DELETE FROM TBL_PARTIDOS WHERE PartidoID = @PartidoID
    `);

    res.json({ message: "Partido eliminado correctamente" });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al eliminar partido" });
  }
});

//GET/GetPartidosFinalizados
router.get("/GetPartidosFinalizados", async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT 
        P.PartidoID,
        P.EquipoLocalID,
        P.EquipoVisitanteID,
        P.FechaPartido,
        P.Estadio,
        P.Fase,
        P.GolesLocal,
        P.GolesVisitante,
        P.Estado_Juego,
        EL.NombreEquipo AS NombreLocal,
        EV.NombreEquipo AS NombreVisitante
      FROM TBL_PARTIDOS P
      INNER JOIN TBL_EQUIPOS EL ON P.EquipoLocalID = EL.EquipoID
      INNER JOIN TBL_EQUIPOS EV ON P.EquipoVisitanteID = EV.EquipoID
      WHERE P.Estado_Juego = 'Finalizado'
      ORDER BY P.FechaPartido
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al obtener partidos finalizados" });
  }
});

//PUT/RegistrarResultado
router.put("/RegistrarResultado", async (req, res) => {
  try {
    const { PartidoID, GolesLocal, GolesVisitante, Estado_Juego } = req.body;

    if (!PartidoID && GolesLocal === undefined && GolesVisitante === undefined) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // 1 — Actualizar goles en TBL_PARTIDOS
    const requestPartido = new sql.Request();
    requestPartido.input('PartidoID', sql.Int, PartidoID);
    requestPartido.input('GolesLocal', sql.Int, GolesLocal);
    requestPartido.input('GolesVisitante', sql.Int, GolesVisitante);
    requestPartido.input('Estado_Juego', sql.VarChar, Estado_Juego || 'Finalizado');

    await requestPartido.query(`
      UPDATE TBL_PARTIDOS
      SET GolesLocal = @GolesLocal,
          GolesVisitante = @GolesVisitante,
          Estado_Juego = @Estado_Juego
      WHERE PartidoID = @PartidoID
    `);

    // 2 — Obtener info del partido para calcular posiciones
    const requestInfo = new sql.Request();
    requestInfo.input('PartidoID', sql.Int, PartidoID);
    const infoResult = await requestInfo.query(`
      SELECT 
        P.EquipoLocalID, P.EquipoVisitanteID,
        EL.Grupo AS GrupoLocal,
        EV.Grupo AS GrupoVisitante
      FROM TBL_PARTIDOS P
      INNER JOIN TBL_EQUIPOS EL ON P.EquipoLocalID = EL.EquipoID
      INNER JOIN TBL_EQUIPOS EV ON P.EquipoVisitanteID = EV.EquipoID
      WHERE P.PartidoID = @PartidoID
    `);

    const partido = infoResult.recordset[0];
    const { EquipoLocalID, EquipoVisitanteID, GrupoLocal } = partido;

    // 3 — Calcular puntos
    let puntosLocal = 0, puntosVisitante = 0;
    let ganadoLocal = 0, ganadoVisitante = 0;
    let empatado = 0, perdidoLocal = 0, perdidoVisitante = 0;

    if (GolesLocal > GolesVisitante) {
      puntosLocal = 3; ganadoLocal = 1; perdidoVisitante = 1;
    } else if (GolesLocal < GolesVisitante) {
      puntosVisitante = 3; ganadoVisitante = 1; perdidoLocal = 1;
    } else {
      puntosLocal = 1; puntosVisitante = 1; empatado = 1;
    }

    // 4 — Función para actualizar posiciones
    const actualizarPosicion = async (equipoID, grupo, puntos, gf, gc, ganado, empatado, perdido) => {
      const req1 = new sql.Request();
      req1.input('EquipoID', sql.Int, equipoID);
      const existe = await req1.query(`
        SELECT PosicionID FROM TBL_POSICIONES WHERE EquipoID = @EquipoID
      `);

      if (existe.recordset.length === 0) {
        // Insertar nuevo registro
        const req2 = new sql.Request();
        req2.input('EquipoID', sql.Int, equipoID);
        req2.input('Grupo', sql.VarChar, grupo);
        req2.input('Puntos', sql.Int, puntos);
        req2.input('GolesAFavor', sql.Int, gf);
        req2.input('GolesEnContra', sql.Int, gc);
        req2.input('Ganados', sql.Int, ganado);
        req2.input('Empatados', sql.Int, empatado);
        req2.input('Perdidos', sql.Int, perdido);

        await req2.query(`
          INSERT INTO TBL_POSICIONES 
            (EquipoID, Grupo, PartidosJugados, Ganados, Empatados, Perdidos, 
             GolesAFavor, GolesEnContra, Puntos)
          VALUES 
            (@EquipoID, @Grupo, 1, @Ganados, @Empatados, @Perdidos,
             @GolesAFavor, @GolesEnContra, @Puntos)
        `);
      } else {
        // Actualizar registro existente
        const req3 = new sql.Request();
        req3.input('EquipoID', sql.Int, equipoID);
        req3.input('Puntos', sql.Int, puntos);
        req3.input('GolesAFavor', sql.Int, gf);
        req3.input('GolesEnContra', sql.Int, gc);
        req3.input('Ganados', sql.Int, ganado);
        req3.input('Empatados', sql.Int, empatado);
        req3.input('Perdidos', sql.Int, perdido);

        await req3.query(`
          UPDATE TBL_POSICIONES
          SET PartidosJugados = PartidosJugados + 1,
              Ganados = Ganados + @Ganados,
              Empatados = Empatados + @Empatados,
              Perdidos = Perdidos + @Perdidos,
              GolesAFavor = GolesAFavor + @GolesAFavor,
              GolesEnContra = GolesEnContra + @GolesEnContra,
              Puntos = Puntos + @Puntos
          WHERE EquipoID = @EquipoID
        `);
      }
    };

    // 5 — Actualizar posiciones de ambos equipos
    await actualizarPosicion(
      EquipoLocalID, GrupoLocal,
      puntosLocal, GolesLocal, GolesVisitante,
      ganadoLocal, empatado, perdidoLocal
    );
    await actualizarPosicion(
      EquipoVisitanteID, GrupoLocal,
      puntosVisitante, GolesVisitante, GolesLocal,
      ganadoVisitante, empatado, perdidoVisitante
    );

    // 6 — Registrar en auditoría
    const requestAuditoria = new sql.Request();
    requestAuditoria.input('PartidoID', sql.Int, PartidoID);
    requestAuditoria.input('GolesLocal', sql.Int, GolesLocal);
    requestAuditoria.input('GolesVisitante', sql.Int, GolesVisitante);
    requestAuditoria.input('UsuarioAccion', sql.VarChar, 'admin');
    requestAuditoria.input('TipoAccion', sql.VarChar, 'REGISTRO_RESULTADO');

    await requestAuditoria.query(`
      INSERT INTO TBL_AUDITORIA 
        (PartidoID, GolesLocal, GolesVisitante, UsuarioAccion, TipoAccion)
      VALUES 
        (@PartidoID, @GolesLocal, @GolesVisitante, @UsuarioAccion, @TipoAccion)
    `);

    res.json({ message: "Resultado registrado correctamente" });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al registrar resultado" });
  }
});

//GET TablaPosiciones
router.get("/GetTablaPosiciones", async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT 
        P.PosicionID,
        P.Grupo,
        P.PartidosJugados,
        P.Ganados,
        P.Empatados,
        P.Perdidos,
        P.GolesAFavor,
        P.GolesEnContra,
        P.Puntos,
        E.NombreEquipo,
        E.EscudoURL
      FROM TBL_POSICIONES P
      INNER JOIN TBL_EQUIPOS E ON P.EquipoID = E.EquipoID
      ORDER BY P.Grupo, P.Puntos DESC, 
               (P.GolesAFavor - P.GolesEnContra) DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al obtener tabla de posiciones" });
  }
});

//GET Auditoria
router.get("/GetLogAuditoria", async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT 
        A.AuditoriaID,
        A.GolesLocal,
        A.GolesVisitante,
        A.FechaAccion,
        A.UsuarioAccion,
        A.TipoAccion,
        EL.NombreEquipo AS NombreLocal,
        EV.NombreEquipo AS NombreVisitante
      FROM TBL_AUDITORIA A
      INNER JOIN TBL_PARTIDOS P ON A.PartidoID = P.PartidoID
      INNER JOIN TBL_EQUIPOS EL ON P.EquipoLocalID = EL.EquipoID
      INNER JOIN TBL_EQUIPOS EV ON P.EquipoVisitanteID = EV.EquipoID
      ORDER BY A.FechaAccion DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al obtener log de auditoría" });
  }
});



module.exports = router;


