const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ejercicioSchema = new Schema({
    nombre: { type: String, required: true },
    series: { type: String, required: true },
    repeticiones: { type: String, required: true },
    imagen: { type: String, default: '' },
    instrucciones: {
        Posición: { type: String, required: true },
        Ejecución: { type: String, required: true },
        Consejo: { type: String, required: true }
    }
});

const rutinaDiariaSchema = new Schema({
    ejercicio1: ejercicioSchema,
    ejercicio2: ejercicioSchema,
    ejercicio3: ejercicioSchema,
    ejercicio4: ejercicioSchema,
    ejercicio5: ejercicioSchema
});

const rutinaSchema = new Schema({
    rango: { type: String, required: true },
    dia1_Pecho_y_Triceps: rutinaDiariaSchema,
    dia2_Espalda_y_Biceps: rutinaDiariaSchema,
    dia3_Piernas: rutinaDiariaSchema,
    dia4_Hombros_y_Abdomen: rutinaDiariaSchema,
    dia5_Cardio_y_Flexibilidad: rutinaDiariaSchema
});

const Rutina = mongoose.model('Rutina_Principiante', rutinaSchema);

module.exports = Rutina;
