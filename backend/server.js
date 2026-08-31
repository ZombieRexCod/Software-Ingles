const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { getPool } = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/', async (req, res) => {
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});