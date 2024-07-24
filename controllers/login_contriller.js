const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const usuarioModel = require('../models/usuarios_models');
const saltRounds = 10;
const { Op } = require('sequelize');
/* Altas de usuario */
const registroAltas = async (req, res, next) => {
    try {
        const { 
            nombre, apellidos, email, telefono, sexo, peso, estatura, 
            estado_suscripcion, dias_suscripcion, tipo_rutina, user, pass, tipo_usuario 
        } = req.body;

        // Verificar si el usuario ya existe en la base de datos por su nombre de usuario o correo electrónico
        const existingUser = await usuarioModel.findOne({
            where: {
                [Op.or]: [
                    { user: user },
                    { email: email }
                ]
            }
        });

        if (existingUser) {
            // Si el usuario ya existe, mostrar un mensaje de error
            if (existingUser.user === user) {
                return res.json({
                    message: 'registro',
                    title: "Error",
                    alertMessage: "El nombre de usuario ya está registrado.",
                    icon: "error",
                    rol: tipo_usuario,
                    name: user
                });
            } else if (existingUser.email === email) {
                return res.json({
                    message: 'registro',
                    title: "Error",
                    alertMessage: "El correo electrónico ya está registrado.",
                    icon: "error",
                    rol: tipo_usuario,
                    name: user
                });
            }
        } else {
            // Cifrar la contraseña
            const hash = await bcrypt.hash(pass, saltRounds);

            // Si el usuario no existe, proceder con la inserción en la base de datos
            const nuevoUsuario = usuarioModel.build({
                nombre, 
                apellidos, 
                email, 
                telefono, 
                sexo, 
                peso, 
                estatura,
                estado_suscripcion,      
                dias_suscripcion,
                tipo_rutina,
                user,
                pass: hash,
                tipo_usuario
            });

            // Guardar la instancia en la base de datos
            await nuevoUsuario.save();

            console.log('Usuario insertado correctamente:', nuevoUsuario.toJSON());
            return res.json({
                message: 'registro',
                title: "Registrado",
                alertMessage: "Usuario insertado correctamente",
                icon: "success",
                rol: tipo_usuario,
                name: user
            });
        }
    } catch (error) {
        console.error('Error en el registro de usuario:', error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};


const login = async (req, res) => {
    const { user, pass } = req.body;
    const usuario = await usuarios.findOne({ where: { user } });
    
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
   
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

/* const register = async (req, res) => {
    const { user, pass } = req.body;
    const usuario = await usuarios.create({ user, pass });
    res.status(201).json({ message: 'User registered successfully' });
}; */

module.exports ={
    login, logout,registroAltas
}


/* const usurioModel = require('../models/usuarios_models'); */

