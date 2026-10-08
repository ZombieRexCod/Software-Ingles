const express = require('express');
const router = express.Router();
const { obtenerMisSalones, obtenerEstudiantesSalon, registrarNota, crearTarea } = require('../controllers/docentes.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth.middleware');

router.get('/salones', verificarToken, permitirRoles('docente'), obtenerMisSalones);
router.get('/salones/:id/estudiantes', verificarToken, permitirRoles('docente'), obtenerEstudiantesSalon);
router.post('/notas', verificarToken, permitirRoles('docente'), registrarNota);
router.post('/tareas', verificarToken, permitirRoles('docente'), crearTarea);

module.exports = router;