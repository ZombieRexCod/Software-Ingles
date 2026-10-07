const express = require('express');
const router = express.Router();
const { obtenerMiHorario, obtenerMisNotas, obtenerMisTareas, obtenerSalonVirtual } = require('../controllers/alumnos.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth.middleware');

router.get('/horario', verificarToken, permitirRoles('estudiante'), obtenerMiHorario);
router.get('/notas', verificarToken, permitirRoles('estudiante'), obtenerMisNotas);
router.get('/tareas', verificarToken, permitirRoles('estudiante'), obtenerMisTareas);
router.get('/salon-virtual', verificarToken, permitirRoles('estudiante'), obtenerSalonVirtual);

module.exports = router;