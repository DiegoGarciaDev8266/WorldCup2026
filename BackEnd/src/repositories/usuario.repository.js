const { sql } = require('../config/db');

// Singleton: módulo cargado una sola vez por Node.js
const usuarioRepository = {

  async buscarPorEmail(email) {
    const request = new sql.Request();
    request.input('email', sql.VarChar, email);
    const result = await request.query(`
      SELECT * FROM TABLA_USUARIOS WHERE email = @email
    `);
    return result.recordset[0];
  },

  async crear(nombre, email, hash) {
    const request = new sql.Request();
    request.input('nombre', sql.VarChar, nombre);
    request.input('email', sql.VarChar, email);
    request.input('password_hash', sql.VarChar, hash);
    await request.query(`
      INSERT INTO TABLA_USUARIOS (nombre, email, password_hash) 
      VALUES (@nombre, @email, @password_hash)
    `);
  },

  async crearConRol(Nombre, Email, hash, ROL) {
    const request = new sql.Request();
    request.input('Nombre', sql.VarChar, Nombre);
    request.input('Email', sql.VarChar, Email);
    request.input('Password_hash', sql.VarChar, hash);
    request.input('ROL', sql.VarChar, ROL);
    await request.query(`
      INSERT INTO TABLA_USUARIOS (Nombre, Email, Password_hash, ROL) 
      VALUES (@Nombre, @Email, @Password_hash, @ROL)
    `);
  },

  async obtenerTodos() {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT 
        US.ID, US.Nombre, US.Email,
        R.Nombre_Rol AS Rol, US.FECHA_CREACION
      FROM TABLA_USUARIOS US 
      INNER JOIN TABLA_ROLES R ON US.ROL = R.ID
    `);
    return result.recordset;
  },

  async obtenerConRoles() {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT 
        U.ID, U.NOMBRE, U.EMAIL,
        R.NOMBRE_ROL,
        U.FECHA_CREACION, U.ESTADO,
        R.USUARIO_CREACION
      FROM TABLA_USUARIOS U
      INNER JOIN TABLA_ROLES R ON U.ROL = R.ID
    `);
    return result.recordset;
  },

  async actualizar(ID, Nombre, Email, ROL, hash) {
    let query = `
      UPDATE TABLA_USUARIOS
      SET Nombre = @Nombre, Email = @Email, ROL = @ROL
    `;
    const request = new sql.Request();
    request.input('ID', sql.Int, ID);
    request.input('Nombre', sql.VarChar, Nombre);
    request.input('Email', sql.VarChar, Email);
    request.input('ROL', sql.Int, ROL);

    if (hash) {
      query += `, Password_Hash = @Password_Hash`;
      request.input('Password_Hash', sql.VarChar, hash);
    }
    query += ` WHERE ID = @ID`;
    await request.query(query);
  },

  async buscarRolPorNombre(NOMBRE_ROL) {
    const request = new sql.Request();
    request.input('NOMBRE_ROL', sql.VarChar, NOMBRE_ROL);
    const result = await request.query(`
      SELECT ID FROM TABLA_ROLES WHERE NOMBRE_ROL = @NOMBRE_ROL
    `);
    return result.recordset[0];
  },

  async actualizarRol(EMAIL, rolID, ESTADO, DESCRIPCION) {
    const request = new sql.Request();
    request.input('EMAIL', sql.VarChar, EMAIL);
    request.input('ROL', sql.Int, rolID);
    request.input('ESTADO', sql.VarChar, ESTADO || 'ACT');
    await request.query(`
      UPDATE TABLA_USUARIOS 
      SET ROL = @ROL, ESTADO = @ESTADO
      WHERE EMAIL = @EMAIL
    `);
  },

  async inactivar(EMAIL) {
    const request = new sql.Request();
    request.input('EMAIL', sql.VarChar, EMAIL);
    await request.query(`
      UPDATE TABLA_USUARIOS SET ESTADO = 'INA' WHERE EMAIL = @EMAIL
    `);
  },

  async buscarOCrearPorGoogle(nombre, email) {
    // Buscar si ya existe
    const request1 = new sql.Request();
    request1.input('email', sql.VarChar, email);
    const result = await request1.query(`
      SELECT * FROM TABLA_USUARIOS WHERE EMAIL = @email
    `);

    if (result.recordset.length > 0) {
      return result.recordset[0]; // ya existe
    }

    // No existe — crear con ROL=1 (usuario)
    const request2 = new sql.Request();
    request2.input('nombre', sql.VarChar, nombre);
    request2.input('email', sql.VarChar, email);
    await request2.query(`
      INSERT INTO TABLA_USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO)
      VALUES (@nombre, @email, 'GOOGLE_AUTH', 1, 'ACT')
    `);

    // Retornar el usuario recién creado
    const request3 = new sql.Request();
    request3.input('email', sql.VarChar, email);
    const nuevo = await request3.query(`
      SELECT * FROM TABLA_USUARIOS WHERE EMAIL = @email
    `);
    return nuevo.recordset[0];
  },

  async eliminar(ID) {
  const request = new sql.Request();
  request.input('ID', sql.Int, ID);
  await request.query(`
    DELETE FROM TABLA_USUARIOS WHERE ID = @ID
  `);
}
};

module.exports = usuarioRepository;