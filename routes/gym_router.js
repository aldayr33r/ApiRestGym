const express = require('express');
const router = express.Router();
const loginControl = require('../controllers/login_contriller');

router.post('/login', loginControl.login);
router.post('/logout', loginControl.logout);
router.post('/registro', loginControl.registroAltas);


module.exports = router;
