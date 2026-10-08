const { sql, getPool } = require('../config/db');

async function obtenerMisSalones(req, res) {
  try {
    const id_usuario = req.usuario.id_usuario;
    const pool = await getPool();

    const docenteResult = await pool.request()
      .input('usuario_id', sql.Int, id_usuario)
      .query('SELECT id FROM Docentes WHERE usuario_id = @usuario_id');

    if (docenteResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró un perfil de docente para este usuario.' });
    }

    const id_docente = docenteResult.recordset[0].id;

    const salonesResult = await pool.request()
      .input('id_docente', sql.Int, id_docente)
      .query(`SELECT s.id, s.nombre, s.estado, s.ciclo_actual, n.nombre AS nivel,
                     ht.dias_semana, ht.hora_inicio, ht.hora_fin,
                     (SELECT COUNT(*) FROM Matriculas m
                      WHERE m.salon_id = s.id AND m.estado = 'activa') AS total_estudiantes
              FROM Salones s
              JOIN Niveles n ON s.nivel_id = n.id
              JOIN Horarios_Tipo ht ON s.horario_tipo_id = ht.id
              WHERE s.docente_id = @id_docente
              ORDER BY s.nombre ASC`);

    res.json({ salones: salonesResult.recordset });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener los salones del docente.' });
  }
}
async function obtenerEstudiantesSalon(req, res) {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;
    const pool = await getPool();

    const docenteResult = await pool.request()
      .input('usuario_id', sql.Int, id_usuario)
      .query('SELECT id FROM Docentes WHERE usuario_id = @usuario_id');

    if (docenteResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró un perfil de docente para este usuario.' });
    }

    const id_docente = docenteResult.recordset[0].id;

    // Verificar que el salón pertenezca a este docente
    const salonResult = await pool.request()
      .input('id_salon', sql.Int, id)
      .input('id_docente', sql.Int, id_docente)
      .query('SELECT id, nombre FROM Salones WHERE id = @id_salon AND docente_id = @id_docente');

    if (salonResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Salón no encontrado o no te pertenece.' });
    }

    const estudiantesResult = await pool.request()
      .input('id_salon', sql.Int, id)
      .query(`SELECT e.id AS id_estudiante, e.codigo_estudiante, u.nombre_completo, u.correo
              FROM Matriculas m
              JOIN Estudiantes e ON m.estudiante_id = e.id
              JOIN Usuarios u ON e.usuario_id = u.id
              WHERE m.salon_id = @id_salon AND m.estado = 'activa'
              ORDER BY u.nombre_completo ASC`);

    res.json({ salon: salonResult.recordset[0].nombre, estudiantes: estudiantesResult.recordset });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener los estudiantes del salón.' });
  }
}
async function registrarNota(req, res) {
  try {
    const { estudiante_id, salon_id, ciclo_id, nota_ciclo, nota_examen_final } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!estudiante_id || !salon_id || !ciclo_id) {
      return res.status(400).json({ mensaje: 'estudiante_id, salon_id y ciclo_id son obligatorios.' });
    }

    const enviadas = [nota_ciclo, nota_examen_final].filter(n => n !== undefined && n !== null);
    if (enviadas.length === 0) {
      return res.status(400).json({ mensaje: 'Envía al menos nota_ciclo o nota_examen_final.' });
    }
    if (enviadas.some(n => typeof n !== 'number' || n < 0 || n > 5)) {
      return res.status(400).json({ mensaje: 'Las notas deben ser números entre 0 y 5.' });
    }

    const pool = await getPool();

    const docenteResult = await pool.request()
      .input('usuario_id', sql.Int, id_usuario)
      .query('SELECT id FROM Docentes WHERE usuario_id = @usuario_id');

    if (docenteResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró un perfil de docente para este usuario.' });
    }

    const id_docente = docenteResult.recordset[0].id;

    // 1. El salón debe ser de este docente
    const salonResult = await pool.request()
      .input('salon_id', sql.Int, salon_id)
      .input('id_docente', sql.Int, id_docente)
      .query('SELECT id FROM Salones WHERE id = @salon_id AND docente_id = @id_docente');

    if (salonResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Salón no encontrado o no te pertenece.' });
    }

    // 2. El ciclo debe pertenecer a ese salón
    const cicloResult = await pool.request()
      .input('ciclo_id', sql.Int, ciclo_id)
      .input('salon_id', sql.Int, salon_id)
      .query('SELECT id FROM Ciclos WHERE id = @ciclo_id AND salon_id = @salon_id');

    if (cicloResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Ciclo no encontrado en este salón.' });
    }

    // 3. El estudiante debe estar matriculado (activo) en ese salón
    const matriculaResult = await pool.request()
      .input('estudiante_id', sql.Int, estudiante_id)
      .input('salon_id', sql.Int, salon_id)
      .query(`SELECT id FROM Matriculas
              WHERE estudiante_id = @estudiante_id AND salon_id = @salon_id AND estado = 'activa'`);

    if (matriculaResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'El estudiante no está matriculado en este salón.' });
    }

    // ¿Ya existe una nota para este estudiante en este ciclo?
    const existente = await pool.request()
      .input('estudiante_id', sql.Int, estudiante_id)
      .input('ciclo_id', sql.Int, ciclo_id)
      .input('salon_id', sql.Int, salon_id)
      .query(`SELECT id, nota_ciclo, nota_examen_final FROM Notas
              WHERE estudiante_id = @estudiante_id AND ciclo_id = @ciclo_id AND salon_id = @salon_id`);

    let notaCiclo = nota_ciclo ?? null;
    let notaFinal = nota_examen_final ?? null;

    if (existente.recordset.length > 0) {
      const previa = existente.recordset[0];
      notaCiclo = nota_ciclo ?? previa.nota_ciclo;
      notaFinal = nota_examen_final ?? previa.nota_examen_final;
    }

    const valores = [notaCiclo, notaFinal].filter(n => n !== null);
    const promedio = Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 10) / 10;
    const estado = promedio >= 3.0 ? 'aprobado' : 'reprobado';

    const request = pool.request()
      .input('estudiante_id', sql.Int, estudiante_id)
      .input('ciclo_id', sql.Int, ciclo_id)
      .input('salon_id', sql.Int, salon_id)
      .input('nota_ciclo', sql.Decimal(3, 1), notaCiclo)
      .input('nota_examen_final', sql.Decimal(3, 1), notaFinal)
      .input('promedio', sql.Decimal(3, 1), promedio)
      .input('estado', sql.VarChar, estado);

    let result;
    if (existente.recordset.length > 0) {
      result = await request.query(`UPDATE Notas
        SET nota_ciclo = @nota_ciclo, nota_examen_final = @nota_examen_final,
            promedio = @promedio, estado = @estado, actualizado_en = GETDATE()
        OUTPUT INSERTED.*
        WHERE estudiante_id = @estudiante_id AND ciclo_id = @ciclo_id AND salon_id = @salon_id`);
    } else {
      result = await request.query(`INSERT INTO Notas
        (estudiante_id, ciclo_id, salon_id, nota_ciclo, nota_examen_final, promedio, estado)
        OUTPUT INSERTED.*
        VALUES (@estudiante_id, @ciclo_id, @salon_id, @nota_ciclo, @nota_examen_final, @promedio, @estado)`);
    }

    res.status(existente.recordset.length > 0 ? 200 : 201).json({
      mensaje: 'Nota registrada correctamente.',
      nota: result.recordset[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al registrar la nota.' });
  }
}
async function crearTarea(req, res) {
  try {
    const { salon_id, ciclo_id, titulo, descripcion, fecha_limite, valor_porcentaje, tipo } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!salon_id || !ciclo_id || !titulo || !fecha_limite) {
      return res.status(400).json({ mensaje: 'salon_id, ciclo_id, titulo y fecha_limite son obligatorios.' });
    }

    if (isNaN(Date.parse(fecha_limite))) {
      return res.status(400).json({ mensaje: 'fecha_limite no es una fecha válida (usa el formato AAAA-MM-DD).' });
    }

    const porcentaje = valor_porcentaje ?? 0;
    if (typeof porcentaje !== 'number' || porcentaje < 0 || porcentaje > 100) {
      return res.status(400).json({ mensaje: 'valor_porcentaje debe ser un número entre 0 y 100.' });
    }

    const pool = await getPool();

    const docenteResult = await pool.request()
      .input('usuario_id', sql.Int, id_usuario)
      .query('SELECT id FROM Docentes WHERE usuario_id = @usuario_id');

    if (docenteResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró un perfil de docente para este usuario.' });
    }

    const id_docente = docenteResult.recordset[0].id;

    // 1. El salón debe ser de este docente
    const salonResult = await pool.request()
      .input('salon_id', sql.Int, salon_id)
      .input('id_docente', sql.Int, id_docente)
      .query('SELECT id FROM Salones WHERE id = @salon_id AND docente_id = @id_docente');

    if (salonResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Salón no encontrado o no te pertenece.' });
    }

    // 2. El ciclo debe pertenecer a ese salón
    const cicloResult = await pool.request()
      .input('ciclo_id', sql.Int, ciclo_id)
      .input('salon_id', sql.Int, salon_id)
      .query('SELECT id FROM Ciclos WHERE id = @ciclo_id AND salon_id = @salon_id');

    if (cicloResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Ciclo no encontrado en este salón.' });
    }

    const result = await pool.request()
      .input('salon_id', sql.Int, salon_id)
      .input('ciclo_id', sql.Int, ciclo_id)
      .input('titulo', sql.VarChar, titulo)
      .input('descripcion', sql.VarChar, descripcion || null)
      .input('fecha_limite', sql.Date, fecha_limite)
      .input('valor_porcentaje', sql.Decimal(5, 2), porcentaje)
      .input('tipo', sql.VarChar, tipo || null)
      .query(`INSERT INTO Tareas (salon_id, ciclo_id, titulo, descripcion, fecha_limite, valor_porcentaje, tipo)
              OUTPUT INSERTED.*
              VALUES (@salon_id, @ciclo_id, @titulo, @descripcion, @fecha_limite, @valor_porcentaje, @tipo)`);

    res.status(201).json({ mensaje: 'Tarea creada exitosamente.', tarea: result.recordset[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear la tarea.' });
  }
}
module.exports = { obtenerMisSalones, obtenerEstudiantesSalon, registrarNota, crearTarea };