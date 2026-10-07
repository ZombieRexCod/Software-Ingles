const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { getPool } = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');
const alumnosRoutes = require('./src/routes/alumnos.routes');   
const adminRoutes = require('./src/routes/admin.routes');    // ← NUEVO

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/alumnos', alumnosRoutes);                          
app.use('/api/admin', adminRoutes);                              // ← NUEVO

// Sirve el frontend (HTML, CSS, JS) desde la carpeta raíz del proyecto
app.use(express.static(path.join(__dirname, '..')));

// Mueve el "health check" de la BD a otra ruta, no a la raíz
app.get('/api/status', async (req, res) => {
  try {
    const pool = await getPool();
    const resultado = await pool.request().query('SELECT COUNT(*) AS total FROM Usuarios');
    res.json({
      mensaje: 'Conexión exitosa a AmericanLandDB',
      usuarios_registrados: resultado.recordset[0].total
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al conectar con la base de datos', error: err.message });
  }
});

const { verificarToken, permitirRoles } = require('./src/middleware/auth.middleware');

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});