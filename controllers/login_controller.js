const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UsuarioModel = require('../models/usuarios_models');
const LogModel = require('../models/Log_model');
const saltRounds = 10;
require('dotenv').config(); 


const obtenerDireccionIP = (req) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return ip;
};


const login = async (req, res, next) => {
    const { user, pass } = req.body;
    const ipUsuario = obtenerDireccionIP(req);


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
        let dias_suscripcion = Math.ceil((fechaFinSuscripcion - fechaActual) / (24 * 60 * 60 * 1000));


        
        if (dias_suscripcion <= 0) {
            dias_suscripcion = 0;
            await UsuarioModel.updateOne({ user }, { dias_suscripcion, estado_suscripcion: 'Inactivo' });
            return res.status(400).json({
                message: 'Suscripción expirada',
                alertMessage: 'Tu suscripción ha expirado. Por favor, renueva tu suscripción.',
                icon: 'warning'
            });
        } else {
            // Actualiza el campo dias_suscripcion en la base de datos
            await UsuarioModel.updateOne({ user }, { dias_suscripcion, estado_suscripcion: 'Activo' });
        }

        console.log('Generando token para el usuario:', user);
        const token = jwt.sign({ id: foundUser._id }, process.env.JWT_SECRET, {
            expiresIn: '1d' // Expira en 1 día
        });

        res.json({ auth: true, token, rol: `${foundUser.tipo_usuario}` , usuario: user, dias : `${foundUser.dias_suscripcion }` });

        const rolUser = foundUser.tipo_usuario;


        const log = new LogModel({
            usuario: user,
            accion: "Iniciar Sesion",
            ip: ipUsuario,
            tipo_usuario: rolUser,
            lugar_accion: "Login"
        });
        
        log.save()
            .then(() => {
                console.log('Log guardado correctamente');
            })
            .catch(error => {
                console.error('Error al hacer el log:', error);
                res.status(500).send('Error en el log');
            });


    } catch (error) {
        console.error('Error en el login:', error);
        next(error);
    }
};

/* Altas de usuario */
const registroAltas = async (req, res, next) => {
    try {
        const ipUsuario = obtenerDireccionIP(req);
        const userAdmin = req.params.user_admin;
        const { 
            nombre, apellidos, email, telefono, sexo, peso, estatura, 
            estado_suscripcion, dias_suscripcion, tipo_rutina, tipo_dieta, user, pass, tipo_usuario
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
            
            //validadcion de ditas
            const peso_user = parseFloat(peso);
            const estatura_user = parseFloat(estatura);
            const sexo_user = sexo;
            const imc = peso_user / (estatura_user * estatura_user); 
            let dieta;          
            console.log(`${imc.toFixed(1)}`) 
            if (imc.toFixed(1) <= 18.5 && sexo_user ==='Hombre'){
                dieta = 'dietaH2';
            }
            else if (imc < 25 && imc >= 18.6  && sexo_user == 'Hombre'){
                dieta = 'dietaH3';

            }else if(imc >= 25 && sexo_user == 'Hombre'){
                dieta = 'dietaH1';
            } else if (imc.toFixed(1) <= 18.5 && sexo_user == 'Mujer'){
                dieta = 'dietaM2';
            }
            else if (imc < 25 && imc>= 18.6  && sexo_user == 'Mujer'){
                dieta = 'dietaM3';

            }else if(imc >= 25 && sexo_user == 'Mujer'){
                dieta = 'dietaM1';
            }


            const nuevoUsuario = new UsuarioModel({
                nombre, apellidos, email, telefono, sexo, peso, estatura,
                estado_suscripcion, dias_suscripcion, tipo_rutina, tipo_dieta: dieta, user, pass: hash, tipo_usuario
            });

            await nuevoUsuario.save();

            console.log('Usuario insertado correctamente:', nuevoUsuario.toJSON());

            
            const log = new LogModel({
                usuario: userAdmin,
                accion: "Registro de usuarios",
                ip: ipUsuario,
                tipo_usuario: "Admin",
                lugar_accion: "Registro"
            });
            
            log.save()
                .then(() => {
                    console.log('Log guardado correctamente');
                })
                .catch(error => {
                    console.error('Error al hacer el log:', error);
                    res.status(500).send('Error en el log');
                });

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
