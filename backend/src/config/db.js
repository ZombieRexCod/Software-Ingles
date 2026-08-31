const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
  }
};

let pool;

async function getPool() {
  if (pool) return pool;

  try {
    pool = await sql.connect(config);
    console.log('✅ Conectado a SQL Server:', process.env.DB_DATABASE);
    return pool;
  } catch (err) {
    console.error('❌ Error de conexión a la base de datos:', err.message);
    throw err;
  }
}

module.exports = { sql, getPool };