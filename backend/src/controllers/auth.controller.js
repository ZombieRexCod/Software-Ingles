const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sql, getPool } = require('../config/db');
require('dotenv').config();

async function registro(req, res) {
  try {
    const { nombre_completo, correo, contrasena, rol, datosPerfil } = req.body;

    if (!nombre_completo || !correo || !contrasena || !rol) {
      return res.status(400).json({ mensaje: 'Nombre, correo, contraseña y rol son obligatorios.' });
    }

    const rolesValidos = ['estudiante', 'docente', 'secretaria'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ mensaje: 'Rol inválido.' });
    }

    const pool = await getPool();

    // Verificar si el correo ya existe
    const existente = await pool.request()
      .input('correo', sql.VarChar, correo)
      .query('SELECT id FROM Usuarios WHERE correo = @correo');

    if (existente.recordset.length > 0) {
      return res.status(409).json({ mensaje: 'Este correo ya está registrado.' });
    }

    // Buscar el id del rol
    const rolResult = await pool.request()
      .input('nombre_rol', sql.VarChar, rol)
      .query('SELECT id FROM Roles WHERE nombre = @nombre_rol');

    const id_rol = rolResult.recordset[0].id;

    const contrasena_hash = await bcrypt.hash(contrasena, 10);

    const resultadoUsuario = await pool.request()
      .input('rol_id', sql.Int, id_rol)
      .input('nombre_completo', sql.VarChar, nombre_completo)
      .input('correo', sql.VarChar, correo)
      .input('contrasena_hash', sql.VarChar, contrasena_hash)
      .query(`INSERT INTO Usuarios (rol_id, nombre_completo, correo, contrasena_hash)
              OUTPUT INSERTED.id
              VALUES (@rol_id, @nombre_completo, @correo, @contrasena_hash)`);

    const nuevoUsuarioId = resultadoUsuario.recordset[0].id;

    if (rol === 'estudiante') {
      const codigo_estudiante = datosPerfil?.codigo_estudiante || `EST${String(nuevoUsuarioId).padStart(4, '0')}`;

      await pool.request()
        .input('usuario_id', sql.Int, nuevoUsuarioId)
        .input('codigo_estudiante', sql.VarChar, codigo_estudiante)
        .query(`INSERT INTO Estudiantes (usuario_id, codigo_estudiante, estado)
                VALUES (@usuario_id, @codigo_estudiante, 'activo')`);

    } else if (rol === 'docente') {
      await pool.request()
        .input('usuario_id', sql.Int, nuevoUsuarioId)
        .input('especialidad', sql.VarChar, datosPerfil?.especialidad || null)
        .query(`INSERT INTO Docentes (usuario_id, especialidad, activo, fecha_ingreso)
                VALUES (@usuario_id, @especialidad, 1, GETDATE())`);

    } else if (rol === 'secretaria') {
      await pool.request()
        .input('usuario_id', sql.Int, nuevoUsuarioId)
        .input('cargo', sql.VarChar, datosPerfil?.cargo || null)
        .input('sede', sql.VarChar, datosPerfil?.sede || null)
        .query(`INSERT INTO Secretarias (usuario_id, cargo, sede, activo)
                VALUES (@usuario_id, @cargo, @sede, 1)`);
    }

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente.', id: nuevoUsuarioId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error en el servidor al registrar usuario.' });
  }
}

async function login(req, res) {
  try {
    const { correo, contrasena, rol } = req.body;

    if (!correo || !contrasena || !rol) {
      return res.status(400).json({ mensaje: 'Correo, contraseña y rol son obligatorios.' });
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('correo', sql.VarChar, correo)
      .query(`SELECT u.id, u.nombre_completo, u.correo, u.contrasena_hash, u.activo,
                     r.nombre AS nombre_rol
              FROM Usuarios u
              JOIN Roles r ON u.rol_id = r.id
              WHERE u.correo = @correo`);

    if (result.recordset.length === 0) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos.' });
    }

    const usuario = result.recordset[0];

    if (usuario.nombre_rol !== rol) {
      return res.status(401).json({ mensaje: 'El rol seleccionado no coincide con el usuario.' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Este usuario se encuentra inactivo.' });
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!contrasenaValida) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos.' });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id, rol: usuario.nombre_rol, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso.',
      token,
      usuario: {
        id: usuario.id,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo,
        rol: usuario.nombre_rol
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error en el servidor al iniciar sesión.' });
  }
}

module.exports = { registro, login };