const mongoose = require('mongoose');

const distriMacronutrienteSchema = new mongoose.Schema({
  proteinas: { type: String, required: true },
  carbohidratos: { type: String, required: true },
  grasas: { type: String, required: true }
});

const consejoSchema = new mongoose.Schema({
  variedad: { type: String, required: true },
  hidratacion: { type: String, required: true },
  suplementos: { type: String, required: true },
  consulta: { type: String, required: true }
});

const snackSchema = new mongoose.Schema({
  alimento1: { type: String, required: true },
  alimento2: { type: String, required: true }
});

const comidaSchema = new mongoose.Schema({
  alimento1: { type: String, required: true },
  alimento2: { type: String, required: true },
  alimento3: { type: String, required: true }
});

const semanaSchema = new mongoose.Schema({
  numeroSemana: { type: Number, required: true, min: 1, max: 4 },
  dias: { type: String, required: true },
  comidas: {
    desayuno: comidaSchema,
    almuerzo: comidaSchema,
    bocadillo: snackSchema,
    cena: comidaSchema,
    snackNoche: snackSchema
  },
  estado: { type: Boolean, default: false }
});

const dietaSchema = new mongoose.Schema({
  nombreDietas: { type: String, required: true, unique: true },
  objetivo: { type: String, required: true },
  sexo: { type: String, required: true },
  caloriasDiarias: { type: String, required: true },
  distribucion_macronutrientes: distriMacronutrienteSchema,
  mes: [semanaSchema],
  consejo: consejoSchema
});

const DietaModel = mongoose.model('Dieta', dietaSchema);

module.exports = DietaModel;