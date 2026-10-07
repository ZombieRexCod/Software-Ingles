const { sql, getPool } = require('../config/db');

async function obtenerUsuarios(req, res) {
  try {
    const pool = await getPool();

    const result = await pool.request()
      .query(`SELECT u.id, u.nombre_completo, u.correo, u.telefono, u.activo, u.creado_en,
                     r.nombre AS rol
              FROM Usuarios u
              JOIN Roles r ON u.rol_id = r.id
              ORDER BY u.creado_en DESC`);

    res.json({ usuarios: result.recordset });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener los usuarios.' });
  }
}

async function cambiarEstadoUsuario(req, res) {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({ mensaje: 'El campo activo debe ser true o false.' });
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('activo', sql.Bit, activo)
      .query(`UPDATE Usuarios SET activo = @activo, actualizado_en = GETDATE()
              OUTPUT INSERTED.id, INSERTED.nombre_completo, INSERTED.activo
              WHERE id = @id`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    res.json({ mensaje: 'Estado actualizado correctamente.', usuario: result.recordset[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar el estado del usuario.' });
  }
}

async function obtenerSalones(req, res) {
  try {
    const pool = await getPool();

    const result = await pool.request()
      .query(`SELECT s.id, s.nombre, s.capacidad_max, s.estado, s.ciclo_actual, s.anno,
                     s.fecha_inicio, s.fecha_fin,
                     n.nombre AS nivel, u.nombre_completo AS docente,
                     ht.dias_semana, ht.hora_inicio, ht.hora_fin
              FROM Salones s
              JOIN Niveles n ON s.nivel_id = n.id
              JOIN Docentes d ON s.docente_id = d.id
              JOIN Usuarios u ON d.usuario_id = u.id
              JOIN Horarios_Tipo ht ON s.horario_tipo_id = ht.id
              ORDER BY s.anno DESC, s.nombre ASC`);

    res.json({ salones: result.recordset });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener los salones.' });
  }
}

async function crearSalon(req, res) {
  try {
    const { docente_id, nivel_id, horario_tipo_id, nombre, capacidad_max, anno, fecha_inicio, fecha_fin } = req.body;

    if (!docente_id || !nivel_id || !horario_tipo_id || !nombre || !anno) {
      return res.status(400).json({ mensaje: 'docente_id, nivel_id, horario_tipo_id, nombre y anno son obligatorios.' });
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('docente_id', sql.Int, docente_id)
      .input('nivel_id', sql.Int, nivel_id)
      .input('horario_tipo_id', sql.Int, horario_tipo_id)
      .input('nombre', sql.VarChar, nombre)
      .input('capacidad_max', sql.Int, capacidad_max || 20)
      .input('anno', sql.Int, anno)
      .input('fecha_inicio', sql.Date, fecha_inicio || null)
      .input('fecha_fin', sql.Date, fecha_fin || null)
      .query(`INSERT INTO Salones (docente_id, nivel_id, horario_tipo_id, nombre, capacidad_max, anno, fecha_inicio, fecha_fin)
              OUTPUT INSERTED.id
              VALUES (@docente_id, @nivel_id, @horario_tipo_id, @nombre, @capacidad_max, @anno, @fecha_inicio, @fecha_fin)`);

    res.status(201).json({ mensaje: 'Salón creado exitosamente.', id: result.recordset[0].id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear el salón.' });
  }
}

async function actualizarSalon(req, res) {
  try {
    const { id } = req.params;
    const { nombre, capacidad_max, estado, ciclo_actual, fecha_inicio, fecha_fin } = req.body;

    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.VarChar, nombre)
      .input('capacidad_max', sql.Int, capacidad_max)
      .input('estado', sql.VarChar, estado)
      .input('ciclo_actual', sql.Int, ciclo_actual)
      .input('fecha_inicio', sql.Date, fecha_inicio || null)
      .input('fecha_fin', sql.Date, fecha_fin || null)
      .query(`UPDATE Salones
              SET nombre = @nombre, capacidad_max = @capacidad_max, estado = @estado,
                  ciclo_actual = @ciclo_actual, fecha_inicio = @fecha_inicio, fecha_fin = @fecha_fin
              OUTPUT INSERTED.*
              WHERE id = @id`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Salón no encontrado.' });
    }

    res.json({ mensaje: 'Salón actualizado correctamente.', salon: result.recordset[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar el salón.' });
  }
}

async function eliminarSalon(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM Salones OUTPUT DELETED.id WHERE id = @id`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Salón no encontrado.' });
    }

    res.json({ mensaje: 'Salón eliminado correctamente.' });

  } catch (err) {
    console.error(err);
    if (err.number === 547) {
      return res.status(409).json({ mensaje: 'No se puede eliminar: este salón tiene matrículas, tareas u otros datos asociados.' });
    }
    res.status(500).json({ mensaje: 'Error al eliminar el salón.' });
  }
}

async function obtenerMatriculas(req, res) {
  try {
    const pool = await getPool();

    const result = await pool.request()
      .query(`SELECT m.id, m.fecha_matricula, m.estado, m.valor_total, m.descuento, m.saldo_pendiente, m.anno,
                     ue.nombre_completo AS estudiante, s.nombre AS salon, us.nombre_completo AS registrado_por
              FROM Matriculas m
              JOIN Estudiantes e ON m.estudiante_id = e.id
              JOIN Usuarios ue ON e.usuario_id = ue.id
              JOIN Salones s ON m.salon_id = s.id
              JOIN Secretarias sec ON m.secretaria_id = sec.id
              JOIN Usuarios us ON sec.usuario_id = us.id
              ORDER BY m.fecha_matricula DESC`);

    res.json({ matriculas: result.recordset });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener las matrículas.' });
  }
}

async function cambiarEstadoMatricula(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'activa', 'cancelada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado inválido. Usa: pendiente, activa o cancelada.' });
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('estado', sql.VarChar, estado)
      .query(`UPDATE Matriculas SET estado = @estado
              OUTPUT INSERTED.*
              WHERE id = @id`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Matrícula no encontrada.' });
    }

    res.json({ mensaje: 'Estado de matrícula actualizado.', matricula: result.recordset[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar la matrícula.' });
  }
}

async function registrarPago(req, res) {
  try {
    const { matricula_id, monto, metodo_pago, referencia_transaccion } = req.body;
    const id_secretaria_usuario = req.usuario.id_usuario;

    if (!matricula_id || !monto || !metodo_pago) {
      return res.status(400).json({ mensaje: 'matricula_id, monto y metodo_pago son obligatorios.' });
    }

    const pool = await getPool();

    // Buscar el id de Secretarias a partir del usuario admin logueado
    const secretariaResult = await pool.request()
      .input('usuario_id', sql.Int, id_secretaria_usuario)
      .query('SELECT id FROM Secretarias WHERE usuario_id = @usuario_id');

    if (secretariaResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró un perfil de secretaria/admin para este usuario.' });
    }

    const id_secretaria = secretariaResult.recordset[0].id;

    // Verificar que la matrícula exista y traer su saldo actual
    const matriculaResult = await pool.request()
      .input('matricula_id', sql.Int, matricula_id)
      .query('SELECT id, saldo_pendiente FROM Matriculas WHERE id = @matricula_id');

    if (matriculaResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Matrícula no encontrada.' });
    }

    const saldoActual = matriculaResult.recordset[0].saldo_pendiente;

    if (monto > saldoActual) {
      return res.status(400).json({ mensaje: `El monto supera el saldo pendiente ($${saldoActual}).` });
    }

    // Registrar el pago
    const pagoResult = await pool.request()
      .input('matricula_id', sql.Int, matricula_id)
      .input('secretaria_id', sql.Int, id_secretaria)
      .input('monto', sql.Decimal(10, 2), monto)
      .input('metodo_pago', sql.VarChar, metodo_pago)
      .input('referencia_transaccion', sql.VarChar, referencia_transaccion || null)
      .query(`INSERT INTO Pagos (matricula_id, secretaria_id, monto, metodo_pago, referencia_transaccion, estado)
              OUTPUT INSERTED.id
              VALUES (@matricula_id, @secretaria_id, @monto, @metodo_pago, @referencia_transaccion, 'exitoso')`);

    // Descontar el pago del saldo pendiente de la matrícula
    const nuevoSaldo = saldoActual - monto;
    await pool.request()
      .input('matricula_id', sql.Int, matricula_id)
      .input('nuevo_saldo', sql.Decimal(10, 2), nuevoSaldo)
      .query(`UPDATE Matriculas SET saldo_pendiente = @nuevo_saldo WHERE id = @matricula_id`);

    res.status(201).json({
      mensaje: 'Pago registrado exitosamente.',
      id_pago: pagoResult.recordset[0].id,
      saldo_pendiente_restante: nuevoSaldo
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al registrar el pago.' });
  }
}

module.exports = { obtenerUsuarios, cambiarEstadoUsuario, obtenerSalones, crearSalon, actualizarSalon, eliminarSalon, obtenerMatriculas, cambiarEstadoMatricula, registrarPago };