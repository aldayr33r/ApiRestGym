const express = require('express');
const router = express.Router();
const loginControl = require('../controllers/login_controller');
const SusController = require('../controllers/Suscripcion_controller');
const verifyToken = require('../controllers/verifyToken')

router.post('/login', loginControl.login);
router.post('/registro', loginControl.registroAltas);
router.get('/rutina/:user', SusController.rutina);
router.get('/dieta/:user', dietaControl.SendDieta);



module.exports = router;
