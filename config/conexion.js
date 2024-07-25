require('dotenv').config();
const mongoose = require('mongoose');

const dbconnect = async () => {
    try {
        mongoose.set('strictQuery', true);
        // Usa comillas invertidas para la interpolación de variables
        /*const mongoURI = `${process.env.MONGOURL}`;*/
        const mongoURI = 'mongodb://127.0.0.1:27017/gym';

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000, // Tiempo de espera para la selección del servidor
            connectTimeoutMS: 20000 // Tiempo de espera para la conexión
        });
        console.log("Conexión correcta");
    } catch (error) {
        console.error("Error en la conexión", error);
    }
}

module.exports = dbconnect;
