const express = require('express');
const router = express.Router();
const loginControl = require('../controllers/login_controller');
const verifyToken = require('../controllers/verifyToken')

router.post('/login', loginControl.login);
router.post('/registro', loginControl.registroAltas);


module.exports = router;
