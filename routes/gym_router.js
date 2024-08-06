const express = require('express');
const router = express.Router();
const loginControl = require('../controllers/login_controller');
const SusController = require('../controllers/Suscripcion_controller');
const dietaController= require('../controllers/dieta_controller');
const verifyToken = require('../controllers/verifyToken')

router.post('/login', loginControl.login);
router.post('/registro', loginControl.registroAltas);
router.get('/rutina/:user', SusController.rutina);
router.put('/actualizar/:user', SusController.update_User);
router.get('/dieta/:user', dietaController.SendDieta);



module.exports = router;
