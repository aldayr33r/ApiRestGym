const User = require('../models/usuarios_models');
const jwt = require('jsonwebtoken');

const login = async (req, res, next) => {
    const { usuario, password } = req.body;
    if (!usuario || !password) {
        return res.status(400).send('Usuario o contraseña no proporcionados');
    }

    try {
        const user = await User.findOne({ usuario });
        if (!user) {
            return res.status(400).send('Usuario no encontrado');
        }

        const validPassword = await user.validatePassword(password);
        if (!validPassword) {
            return res.status(400).json({auth: false, message: 'Contraseña incorecta' });
        }

        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: 60 * 60 * 24
        });

        res.json({auth: true, token})

    } catch (error) {
        next(error);
    }
};


const prueba =  (req, res, next) => { 
    return res.json({message: 'hola'})
}

module.exports = {
    login,
    prueba
};
