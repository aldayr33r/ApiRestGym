const rutinapModel = require('../models/rutinas_principiante_models');
const userModel = require('../models/usuarios_models');


const rutina = async (req, res, next) => {
    try {
        const { user } = req.params;

        // Consulta al modelo de usuario para obtener la información de peso
        const usuario = await userModel.findOne({ user });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        if (usuario.dias_suscripcion <= 0) {
            return res.status(400).json({
                message: 'Suscripción expirada',
                alertMessage: 'Tu suscripción ha expirado. Por favor, renueva tu suscripción.',
                icon: 'warning'
            });
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

module.exports = {
    rutina
};
