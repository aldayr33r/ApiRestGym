const rutinapModel = require('../models/rutinas_principiante_models');
const userModel = require('../models/usuarios_models');
const bcrypt = require('bcrypt');



const rutina = async (req, res, next) => {
    try {
        const { user } = req.params;

        // Consulta al modelo de usuario para obtener la información de peso
        const usuario = await userModel.findOne({ user });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
       
   
        // Convertir el peso de string a número
        const peso_user = parseFloat(usuario.peso);

        let rutinaAsignada;
        let rango;

        // Asigna el rango correspondiente según el peso del usuario
        if (peso_user >= 50 && peso_user <= 80) {
            rango = 'Rango1';
        } else if (peso_user > 80 && peso_user <= 110) {
            rango = 'Rango2';
        } else if (peso_user > 110) {
            rango = 'Rango3';
        } else {
            return res.status(400).json({ message: 'Peso fuera de los rangos definidos' });
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
            rutina: {
                dia1_Pecho_y_Triceps,
                dia2_Espalda_y_Biceps,
                dia3_Piernas,
                dia4_Hombros_y_Abdomen,
                dia5_Cardio_y_Flexibilidad
            }
        });
    } catch (err) {
        next(err);
    }
};


const update_User = async (req, res, next) => {
    const userParam = req.params.user;
    const { nombre, apellidos, email, telefono, sexo, peso, estatura, estado_suscripcion, user, pass } = req.body;
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
        if (usuariofound.estado_suscripcion === 'Activo' && estado_suscripcion === 'inactivo') {
            return res.status(400).json({ message: 'No se puede actualizar el estado de suscripción a inactivo desde Activo' });
        }



        // Actualiza los campos del usuario
        usuariofound.nombre = nombre || usuariofound.nombre;
        usuariofound.apellidos = apellidos || usuariofound.apellidos;
        usuariofound.email = email || usuariofound.email;
        usuariofound.telefono = telefono || usuariofound.telefono;
        usuariofound.sexo = sexo || usuariofound.sexo;
        usuariofound.peso = peso || usuariofound.peso;
        usuariofound.estatura = estatura || usuariofound.estatura;
        usuariofound.user = user || usuariofound.user;

        // Encripta la contraseña si se proporciona una nueva
        if (pass) {
            const hash = await bcrypt.hash(pass, saltRounds);
            usuariofound.pass = hash;
        }

        // Actualiza el estado de suscripción si se proporciona y actualiza la fecha de registro
        if (estado_suscripcion) {
            usuariofound.estado_suscripcion = estado_suscripcion;
            usuariofound.fecha_registro = new Date();
        }

        // Guarda los cambios en la base de datos
        await usuariofound.save();

        res.json({ message: 'Usuario actualizado correctamente', usuario: usuariofound });
    } catch (err) {
        next(err);
    }
};


const listar_Usuarios = async (req, res, next) => {
    try {
        const { usuariof } = req.params;

        // Consulta al modelo de usuario para obtener la información de peso
        const usuario = await userModel.findOne({ usuariof });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }


        const { nombre, apellidos, email, telefono, sexo, peso, estatura, estado_suscripcion, dias_suscripcion, tipo_rutina, tipo_dieta, user, pass, tipo_usuario, fecha_registro} = usuario;


        res.json({ message: 'Usuario listado correctamente', 
                nombre: nombre,
                apellidos:apellidos,
                email:email,
                telefono:telefono,
                sexo:sexo,
                peso:peso,
                estatura:estatura,
                estado_suscripcion:estado_suscripcion,
                dias_suscripcion:dias_suscripcion,
                tipo_rutina:tipo_rutina,
                tipo_dieta:tipo_dieta,
                user:user,
                pass:pass,
                tipo_usuario:tipo_usuario,
                fecha_registro:fecha_registro});
       
    } catch (err) {
        next(err);
    }
};



const eliminar_Usuarios = async (req, res, next) => {
   
        try {
          const usuariof = req.params;
          const resultado = await userModel.findOneAndDelete({ usuariof });
      
          if (!resultado) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
          }
      
          res.json({ mensaje: 'Usuario eliminado correctamente' });
        } catch (error) {
          res.status(500).json({ mensaje: 'Error al eliminar el Usuario', error });
        }
};



module.exports = {
    rutina,
    update_User,
    listar_Usuarios,
    eliminar_Usuarios
};
