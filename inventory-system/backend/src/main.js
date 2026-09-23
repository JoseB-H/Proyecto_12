require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check básico
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Health check de base de datos
app.get('/api/health/db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS connected');
    res.json({ status: 'OK', database: 'connected', result: rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected', message: error.message });
  }
});

// Endpoint de prueba: listar tablas
app.get('/api/tables', async (req, res) => {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    res.json({ tables: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TODO: Registrar rutas desde adapters/routes

// Iniciar servidor con conexión a BD
async function startServer() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  DB check:     http://localhost:${PORT}/api/health/db`);
    });
  } catch (error) {
    console.error('💥 No se pudo iniciar el servidor:', error.message);
    console.log('⏳ Reintentando en 5 segundos...');
    setTimeout(startServer, 5000);
  }
}

startServer();
