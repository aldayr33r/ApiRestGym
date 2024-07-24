const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const usuarios = require('../models/usuarios_models')




const login = async (req, res) => {
    const { user, pass } = req.body;
    const usuario = await usuarios.findOne({ where: { user } });
    
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
   
    
    req.session.user = user;
    req.session.userId = user.id;
    req.session.userRole = user.role;
    res.json({ message: 'Login successful' });
}
const logout = async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.json({ message: 'Logout successful' });
    });
};

const register = async (req, res) => {
    const { user, pass } = req.body;
    const usuario = await usuarios.create({ user, pass });
    res.status(201).json({ message: 'User registered successfully' });
};

module.exports ={
    login, logout,register
}


/* const usurioModel = require('../models/usuarios_models'); */

