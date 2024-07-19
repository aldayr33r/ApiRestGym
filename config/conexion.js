
const Sequelize = require('sequelize');

const conexion = new Sequelize('gym', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  define: {
    timestamps: false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});




conexion.authenticate()
  .then(() => {
    console.log('Conexión establecida correctamente.');
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos:', err);
  });

module.exports = conexion;