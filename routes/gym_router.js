const express = require('express');
const router = express.Router();
const loginControl = require('../controllers/login_controller');
const SusController = require('../controllers/Suscripcion_controller');
const dietaController= require('../controllers/dieta_controller');
const verifyToken = require('../controllers/verifyToken')

router.post('/login', loginControl.login);
router.post('/registro/:user_admin', verifyToken, loginControl.registroAltas);
router.get('/rutina/:user', verifyToken, SusController.rutina);
router.get('/perfil/:user', verifyToken, SusController.listar_info_Usuarios);
router.get('/logs/:user_admin', verifyToken, SusController.listar_logs);
router.get('/listar_Usuarios/:user_admin', verifyToken, SusController.listar_allUsuarios);
router.delete('/eliminar_Usuarios/:user/:user_admin', verifyToken, SusController.eliminar_Usuarios);
router.put('/actualizar/:user/:user_admin', verifyToken, SusController.update_User);
router.put('/actualizar_info/:user', verifyToken, SusController.update_Info_User);
router.put('/actualizar_sus/:user/:user_admin', verifyToken, SusController.actualizar_suscripcion);
router.get('/dieta/:user', verifyToken, dietaController.SendDieta);



module.exports = router;
