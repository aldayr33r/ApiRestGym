const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UsuarioModel = require('../models/usuarios_models');
const saltRounds = 10;
require('dotenv').config();

const login = async (req, res, next) => {
    const { user, pass } = req.body;

    if (!user || !pass) {
        return res.status(400).json({
            message: 'Login',
            title: "Error",
            alertMessage: "Usuario o contraseña no proporcionados",
            icon: "error",
            name: user
        });
    }

    try {
        console.log('Buscando usuario:', user);
        const foundUser = await UsuarioModel.findOne({ user });

        if (!foundUser) {
            console.log('Usuario no encontrado');
            return res.status(204).json({
                message: 'Login',
                title: "Error",
                alertMessage: "Usuario no encontrado",
                icon: "error",
                name: user
            });
        }
       
        console.log('Validando contraseña para el usuario:', user);
        const validPassword = await foundUser.validatePassword(pass);

        if (!validPassword) {
            console.log('Contraseña incorrecta');
            return res.status(401).json({ auth: false, message: 'Contraseña incorrecta' });
        }

        const fechaRegistro = new Date(foundUser.fecha_registro);
        const fechaActual = new Date();
        const unMes = 30 * 24 * 60 * 60 * 1000; // 30 días en milisegundos
        const fechaFinSuscripcion = new Date(fechaRegistro.getTime() + unMes);
        const dias_suscripcion = Math.ceil((fechaFinSuscripcion - fechaActual) / (24 * 60 * 60 * 1000));

        // Actualiza el campo diasRestantes en la base de datos
        await UsuarioModel.updateOne({ user }, { dias_suscripcion });

        console.log('Generando token para el usuario:', user);
        const token = jwt.sign({ id: foundUser._id }, process.env.JWT_SECRET, {
            expiresIn: '1d' // Expira en 1 día
        });

        res.json({ auth: true, token, rol: `${foundUser.tipo_usuario}` , usuario: user});
    } catch (error) {
        console.error('Error en el login:', error);
        next(error);
    }
};

/* Altas de usuario */
const registroAltas = async (req, res, next) => {
    try {
        const { 
            nombre, apellidos, email, telefono, sexo, peso, estatura, 
            estado_suscripcion, dias_suscripcion, tipo_rutina, user, pass, tipo_usuario 
        } = req.body;

        const existingUser = await UsuarioModel.findOne({
            $or: [{ user: user }, { email: email }]
        });

        if (existingUser) {
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
            const hash = await bcrypt.hash(pass, saltRounds);

            const nuevoUsuario = new UsuarioModel({
                nombre, apellidos, email, telefono, sexo, peso, estatura,
                estado_suscripcion, dias_suscripcion, tipo_rutina, user, pass: hash, tipo_usuario
            });

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
        next(error);
    }
};

module.exports = {
    login,
    registroAltas
};
