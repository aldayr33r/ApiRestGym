const Sequelize = require('sequelize');
const conexion = require('../config/conexion.js');

const LogModel = conexion.define("logs", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    accion: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    ip:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    fecha: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    tipo_usuario: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lugar_accion:{
        type:Sequelize.STRING,
        allowNull: false,
    }
      
});

module.exports = LogModel;