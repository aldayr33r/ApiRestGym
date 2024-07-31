const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  sexo: { type: String, required: true },
  peso: { type: String, required: true },
  estatura: { type: String, required: true },
  estado_suscripcion: { type: String, default:"Activo" },
  dias_suscripcion: { type: String, default:0 },
  tipo_rutina: { type: String, default:"Rango1" },
  user: { type: String, required: true, unique: true },
  pass: { type: String, required: true },
  tipo_usuario: { type: String, required: true },
  fecha_registro: { type: Date, default: Date.now },
});

usuarioSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.pass);
};

const UsuarioModel = mongoose.model('Usuario', usuarioSchema);

module.exports = UsuarioModel;