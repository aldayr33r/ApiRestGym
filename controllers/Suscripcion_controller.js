const rutinapModel = require('../models/rutinas_principiante_models');
const cron = require('node-cron');
const userModel = require('../models/usuarios_models');
const LogModel = require('../models/Log_model');
const bcrypt = require('bcrypt');
const transporter = require('../config/mailer.js');



async function verificarSuscripciones() {
    try {
        const usuarios = await userModel.find(); // Obtener todos los usuarios

        usuarios.forEach(async (foundUser) => {
            const fechaRegistro = new Date(foundUser.fecha_registro);
            const fechaActual = new Date();
            const unMes = 30 * 24 * 60 * 60 * 1000; // 30 días en milisegundos
            const fechaFinSuscripcion = new Date(fechaRegistro.getTime() + unMes);
            let dias_suscripcion = Math.ceil((fechaFinSuscripcion - fechaActual) / (24 * 60 * 60 * 1000));

            // Si quedan 10, 5 o 1 día, enviar un correo
            if ([10, 5, 1].includes(dias_suscripcion)) {
                const clientUsers = await userModel.find({ tipo_usuario: 'client' }); // Cambiado findAll a find

                if (clientUsers.length > 0) {
                    clientUsers.forEach(async (clientUser) => {
                        const correoCli = clientUser.email;

                        const mailBody = `
                            <h2>Estimado usuario,</h2>
                            <p>Nos dirigimos a ti para informarte que la suscripción del usuario <strong>${foundUser.nombre}</strong> está próxima a expirar.</p>
                            <p>Quedan <strong>${dias_suscripcion} días</strong> para que la suscripción llegue a su fin.</p>
                            <p>Para evitar la interrupción en los servicios, te recomendamos encarecidamente que te pongas en contacto con el Administrador y procedas a renovar la suscripción a la mayor brevedad.</p>
                            <p>Recuerda que mantener tu suscripción activa te permite seguir disfrutando de todas las ventajas y beneficios que ofrecemos.</p>
                            <p>Si tienes alguna duda o necesitas asistencia, no dudes en comunicarte con nuestro equipo de soporte.</p>
                            <p>Saludos cordiales,</p>
                            <p><strong>El equipo de Aztetics</strong></p>`;

                            const mailOptions = {
                                from: 'aztetics.ti@gmail.com',
                                to: correoCli,
                                subject: `Aviso: La suscripción de ${foundUser.nombre} expira en ${dias_suscripcion} días`,
                                 html: mailBody
                            };


                        try {
                            await transporter.sendMail(mailOptions);
                            console.log(`Correo electrónico enviado al Usuario: ${correoCli}`);
                        } catch (error) {
                            console.log('Error al enviar el correo electrónico:', error);
                        }
                    });
                }
            }
        });
    } catch (error) {
        console.log('Error al verificar suscripciones:', error);
    }
}


// Configurar cron job para que se ejecute todos los días a las 00:00
cron.schedule('0 13 * * *', verificarSuscripciones);


const obtenerDireccionIP = (req) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return ip;
};


const rutina = async (req, res, next) => {
    try {
        const ipUsuario = obtenerDireccionIP(req);
        const { user } = req.params;

        // Consulta al modelo de usuario para obtener la información de peso
        const usuario = await userModel.findOne({ user });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
       
   
        // Convertir el peso de string a número
        const peso_user = parseFloat(usuario.peso);
        const sexo_user = usuario.sexo;
        const estatura_user = parseFloat(usuario.estatura);
        const alturaMetros = estatura_user / 100;
        const imc_user = peso_user / (alturaMetros * alturaMetros);


        let rutinaAsignada;
        let rango;

        // Asigna el rango correspondiente según el peso del usuario
        if (sexo_user === 'Femenino') {
            if (imc_user >= 18.5 && imc_user <= 24.9) {
                rango = 'RangoM1';
            } else if (imc_user > 24.9 && imc_user <= 29.9) {
                rango = 'RangoM2';
            } else if (imc_user > 29.9 && imc_user <= 34.9) {
                rango = 'RangoM3';
            } else if (imc_user > 34.9) {
                rango = 'RangoM4';
            } else {
                return res.status(400).json({ message: 'IMC fuera de los rangos definidos para mujeres' });
            }
        } else if (sexo_user === 'Masculino') {
            if (imc_user >= 18.5 && imc_user <= 24.9) {
                rango = 'RangoH1';
            } else if (imc_user > 24.9 && imc_user <= 29.9) {
                rango = 'RangoH2';
            } else if (imc_user > 29.9 && imc_user <= 34.9) {
                rango = 'RangoH3';
            } else if (imc_user > 34.9) {
                rango = 'RangoH4';
            } else {
                return res.status(400).json({ message: 'IMC fuera de los rangos definidos para hombres' });
            }
        }

        // Consulta al modelo de rutina para obtener la rutina correspondiente al rango
        rutinaAsignada = await rutinapModel.findOne({rango});

        // Verifica si la rutina asignada es válida antes de enviarla
        if (!rutinaAsignada) {
            return res.status(404).json({ message: 'Rutina asignada no encontrada' });
        }else {
            // Actualiza el campo tipo_rutina en la base de datos
            await userModel.updateOne({ user }, { tipo_rutina: rango });
        }

        // Desglosa la rutina
        const { dia1_Pecho_y_Triceps, dia2_Espalda_y_Biceps, dia3_Piernas, dia4_Hombros_y_Abdomen, dia5_Cardio_y_Flexibilidad } = rutinaAsignada;

        // Enviar la respuesta
        res.json({
            message: 'Rutina asignada',
            Tipo_rutina: rango,
            rutina: {
                dia1_Pecho_y_Triceps,
                dia2_Espalda_y_Biceps,
                dia3_Piernas,
                dia4_Hombros_y_Abdomen,
                dia5_Cardio_y_Flexibilidad
            }
        });

        const rolUser = usuario.tipo_usuario;

        const log = new LogModel({
            usuario: user,
            accion: "Consultar Rutina",
            ip: ipUsuario,
            tipo_usuario: rolUser,
            lugar_accion: "Rutinas"
        });
        
        log.save()
            .then(() => {
                console.log('Log guardado correctamente');
            })
            .catch(error => {
                console.error('Error al hacer el log:', error);
                res.status(500).send('Error en el log');
            });

    } catch (err) {
        next(err);
    }
};


const update_User = async (req, res, next) => {
    const ipUsuario = obtenerDireccionIP(req);
    const userParam = req.params.user;
    const userAdmin = req.params.user_admin;
    const { nombre, apellidos, email, telefono, peso, estatura, user, pass } = req.body;
    const saltRounds = 10; // Número de rondas para generar el salt

    try {
        // Buscar el usuario por el parámetro 'user'
        const usuariofound = await userModel.findOne({ user: userParam });

        // Verificar si el usuario existe
        if (!usuariofound) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (email) {
            const emailExists = await userModel.findOne({ email, _id: { $ne: usuariofound._id } });
            if (emailExists) {
                return res.status(400).json({ message: 'El correo electrónico ya está en uso por otro usuario' });
            }
        }
        
        if (user) {
            const userExists = await userModel.findOne({ user, _id: { $ne: usuariofound._id } });
            if (userExists) {
                return res.status(400).json({ message: 'El nombre de usuario ya está en uso por otro usuario' });
            }
        }
        


        // Actualiza los campos del usuario
        usuariofound.nombre = nombre || usuariofound.nombre;
        usuariofound.apellidos = apellidos || usuariofound.apellidos;
        usuariofound.email = email || usuariofound.email;
        usuariofound.telefono = telefono || usuariofound.telefono;
        usuariofound.peso = peso || usuariofound.peso;
        usuariofound.estatura = estatura || usuariofound.estatura;
        usuariofound.user = user || usuariofound.user;

        // Encripta la contraseña si se proporciona una nueva y es distinta a la anterior
        if (usuariofound.pass !== pass) {
            const hash = await bcrypt.hash(pass, saltRounds);
            usuariofound.pass = hash;
        }

        // Actualiza el estado de suscripción si se proporciona y actualiza la fecha de registro
        /*if (estado_suscripcion) {
            usuariofound.estado_suscripcion = estado_suscripcion;
            usuariofound.fecha_registro = new Date();
        }*/

        // Guarda los cambios en la base de datos
        await usuariofound.save();


        const log = new LogModel({
            usuario: userAdmin,
            accion: "Actualizar Usuario",
            ip: ipUsuario,
            tipo_usuario: "Admin",
            lugar_accion: "Actualizar"
        });
        
        log.save()
            .then(() => {
                console.log('Log guardado correctamente');
            })
            .catch(error => {
                console.error('Error al hacer el log:', error);
                res.status(500).send('Error en el log');
            });



        res.json({ message: 'Usuario actualizado correctamente', usuario: usuariofound });
    } catch (err) {
        next(err);
    }
};


const eliminar_Usuarios = async (req, res, next) => {
   
        try {
        const ipUsuario = obtenerDireccionIP(req);
          const usuariof = req.params.user;
          const userAdmin = req.params.user_admin;
          const resultado = await userModel.findOneAndDelete({ user: usuariof });
      
          if (!resultado) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
          }

          if (resultado.tipo_usuario === 'Admin') {
            return res.status(404).json({ mensaje: 'No puedes eliminar un administrador' });
          }
      
          res.json({ mensaje: 'Usuario eliminado correctamente' });


          const log = new LogModel({
            usuario: userAdmin,
            accion: "Eliminar Usuario",
            ip: ipUsuario,
            tipo_usuario: "Admin",
            lugar_accion: "Eliminar"
        });
        
        log.save()
            .then(() => {
                console.log('Log guardado correctamente');
            })
            .catch(error => {
                console.error('Error al hacer el log:', error);
                res.status(500).send('Error en el log');
            });
        } 
        catch (error) {
          res.status(500).json({ mensaje: 'Error al eliminar el Usuario', error });
        }
};


const listar_allUsuarios = async (req, res, next) => {
    try {
        const ipUsuario = obtenerDireccionIP(req);
        const userAdmin = req.params.user_admin;                                                                                                                                                                                        
        const usuarios = await userModel.find(); // Obtener todos los platillos de la base de datos
        res.status(200).json({message: 'Usuarios listados correctamente',users: usuarios}); // Enviar los platillos como respuesta en formato JSON


        const log = new LogModel({
            usuario: userAdmin,
            accion: "Listar Usuarios",
            ip: ipUsuario,
            tipo_usuario: "Admin",
            lugar_accion: "Listar todos los usuarios"
        });
        
        log.save()
            .then(() => {
                console.log('Log guardado correctamente');
            })
            .catch(error => {
                console.error('Error al hacer el log:', error);
                res.status(500).send('Error en el log');
            });
    }catch(error){
        res.status(500).json({ message: 'Error al listar los usuarios', error });
    
    }
}


const update_Info_User = async (req, res, next) => {
    const userParam = req.params.user;
    const ipUsuario = obtenerDireccionIP(req);
    const { telefono, peso, estatura } = req.body;
    try {
        // Buscar el usuario por el parámetro 'user'
        const usuariofound = await userModel.findOne({ user: userParam });

        // Verificar si el usuario existe
        if (!usuariofound) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }



        // Actualiza los campos del usuario
        usuariofound.telefono = telefono || usuariofound.telefono;
        usuariofound.peso = peso || usuariofound.peso;
        usuariofound.estatura = estatura || usuariofound.estatura;

        // Guarda los cambios en la base de datos
        await usuariofound.save();

        res.json({ message: 'Usuario actualizado correctamente', usuario: usuariofound });

        const log = new LogModel({
            usuario: userParam,
            accion: "Editar informacion de usuarios",
            ip: ipUsuario,
            tipo_usuario: "Client",
            lugar_accion: "Actualizar perfil"
        });
        
        log.save()
            .then(() => {
                console.log('Log guardado correctamente');
            })
            .catch(error => {
                console.error('Error al hacer el log:', error);
                res.status(500).send('Error en el log');
            });

    } catch (err) {
        next(err);
    }
};


const actualizar_suscripcion = async (req, res, next) => {
    const userParam = req.params.user;
    const ipUsuario = obtenerDireccionIP(req);
    const userAdmin = req.params.user_admin;
    try {
        // Buscar el usuario por el parámetro 'user'
        const usuariofound = await userModel.findOne({ user: userParam });

        // Verificar si el usuario existe
        if (!usuariofound) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const estado_suscripcion="Activo";
        usuariofound.estado_suscripcion = estado_suscripcion;
        usuariofound.fecha_registro = new Date();

        const fechaRegistro = new Date(usuariofound.fecha_registro);
        const fechaActual = new Date();
        const unMes = 30 * 24 * 60 * 60 * 1000; // 30 días en milisegundos
        const fechaFinSuscripcion = new Date(fechaRegistro.getTime() + unMes);
        let dias_suscripcion = Math.ceil((fechaFinSuscripcion - fechaActual) / (24 * 60 * 60 * 1000));
    
        usuariofound.dias_suscripcion = dias_suscripcion;

        await usuariofound.save();

        res.json({ message: 'Suscripcion actualizada correctamente', usuario: usuariofound });

        const log = new LogModel({
            usuario: userAdmin,
            accion: "cambiar estado de suscripcion",
            ip: ipUsuario,
            tipo_usuario: "Admin",
            lugar_accion: "Renovar suscripcion"
        });
        
        log.save()
            .then(() => {
                console.log('Log guardado correctamente');
            })
            .catch(error => {
                console.error('Error al hacer el log:', error);
                res.status(500).send('Error en el log');
            });


    } catch (err) {
        next(err);
    }
};


const listar_info_Usuarios = async (req, res, next) => {
    try {
        const usuariof = req.params.user;
        const ipUsuario = obtenerDireccionIP(req);

        // Consulta al modelo de usuario para obtener la información de peso
        const usuario = await userModel.findOne({ user: usuariof });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }


        const { nombre, apellidos, email, telefono, sexo, peso, estatura, user} = usuario;


        res.json({ message: 'Usuario listado correctamente', 
                nombre: nombre,
                apellidos:apellidos,
                email:email,
                telefono:telefono,
                sexo:sexo,
                peso:peso,
                estatura:estatura,
                user:user});



                const log = new LogModel({
                    usuario: usuariof,
                    accion: "Listar info Usuarios",
                    ip: ipUsuario,
                    tipo_usuario: "Client",
                    lugar_accion: "Perfil Usuario"
                });
                
                log.save()
                    .then(() => {
                        console.log('Log guardado correctamente');
                    })
                    .catch(error => {
                        console.error('Error al hacer el log:', error);
                        res.status(500).send('Error en el log');
                    });
       
    } catch (err) {
        next(err);
    }
};


const listar_logs = async (req, res, next) => {
    try {
        const ipUsuario = obtenerDireccionIP(req);
        const userAdmin = req.params.user_admin;                                                                                                                                                                                        
        const logs = await LogModel.find(); // Obtener todos los platillos de la base de datos
        res.status(200).json({message: 'Usuarios listados correctamente', Acciones: logs}); // Enviar los platillos como respuesta en formato JSON


        const log = new LogModel({
            usuario: userAdmin,
            accion: "Listar logs",
            ip: ipUsuario,
            tipo_usuario: "Admin",
            lugar_accion: "logs"
        });
        
        log.save()
            .then(() => {
                console.log('Log guardado correctamente');
            })
            .catch(error => {
                console.error('Error al hacer el log:', error);
                res.status(500).send('Error en el log');
            });
    }catch(error){
        res.status(500).json({ message: 'Error al listar los usuarios', error });
    
    }
}

module.exports = {
    rutina,
    update_User,
    eliminar_Usuarios,
    listar_allUsuarios,
    update_Info_User,
    actualizar_suscripcion,
    listar_info_Usuarios,
    listar_logs
};



