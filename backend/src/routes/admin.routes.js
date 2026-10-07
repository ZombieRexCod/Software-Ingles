const express = require('express');
const router = express.Router();
const { verificarToken, permitirRoles } = require('../middleware/auth.middleware');
const { obtenerUsuarios, cambiarEstadoUsuario, obtenerSalones, crearSalon, actualizarSalon, eliminarSalon, obtenerMatriculas, cambiarEstadoMatricula, registrarPago } = require('../controllers/admin.controller');

router.get('/usuarios', verificarToken, permitirRoles('admin'), obtenerUsuarios);
router.put('/usuarios/:id/estado', verificarToken, permitirRoles('admin'), cambiarEstadoUsuario);
router.get('/salones', verificarToken, permitirRoles('admin'), obtenerSalones);
router.post('/salones', verificarToken, permitirRoles('admin'), crearSalon);
router.put('/salones/:id', verificarToken, permitirRoles('admin'), actualizarSalon);
router.delete('/salones/:id', verificarToken, permitirRoles('admin'), eliminarSalon);
router.get('/matriculas', verificarToken, permitirRoles('admin'), obtenerMatriculas);
router.put('/matriculas/:id/estado', verificarToken, permitirRoles('admin'), cambiarEstadoMatricula);
router.post('/pagos', verificarToken, permitirRoles('admin'), registrarPago);

module.exports = router;