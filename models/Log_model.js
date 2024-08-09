const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    usuario: {
        type: String,
        required: true
    },
    accion: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    tipo_usuario: {
        type: String,
        required: true
    },
    lugar_accion: {
        type: String,
        required: true
    }
});

const LogModel = mongoose.model('Log', LogSchema);

module.exports = LogModel;
