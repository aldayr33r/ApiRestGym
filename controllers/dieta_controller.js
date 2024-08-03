const DietaModel = require('../models/dietas_model'); 
const UsuarioModel = require('../models/usuarios_models');
const altaDieta = async (req, res, next) => {
    try {
        const dietaData = req.body;
        // Verifica si ya existe una dieta con el mismo nombre
    const dietaExistePorNombre = await DietaModel.findOne({ nombreDietas: dietaData.nombreDietas });
    if (dietaExistePorNombre) {
      return res.status(400).json({
        message: 'Nueva dieta',
        title: "Error",
        alertMessage: "La dieta ya está registrada con este nombre",
        icon: "error",
        objetivo: dietaData.objetivo
      });
    }
    
    // Verifica si ya existe una dieta con el mismo objetivo y sexo
    const dietaExistePorObjetivoYSexo = await DietaModel.findOne({
      objetivo: dietaData.objetivo,
      sexo: dietaData.sexo
    });
    if (dietaExistePorObjetivoYSexo) {
      return res.status(400).json({
        message: 'Nueva dieta',
        title: "Error",
        alertMessage: "Ya existe una dieta registrada con este objetivo y sexo",
        icon: "error",
        objetivo: dietaData.objetivo
      });
    }
    
        const nuevaDieta = new DietaModel(dietaData);
        await nuevaDieta.save();

        console.log('Dieta insertada correctamente:', nuevaDieta.toJSON());
        return res.json({
            message: 'registro',
            title: "Registrado",
            alertMessage: "Dieta insertada correctamente",
            icon: "success"
        });
    } catch (error) {
        console.error('Error en el registro de dieta:', error);
        return res.status(500).json({ message: 'Error en el servidor' });
        next(error);
    }
};

const eliminarDietas = async (req, res, next) => {
    try {
      const key = req.params.key;
      const value=   req.params.value;
      let query = {};
      query[key] = value;
      const resultado = await DietaModel.findOneAndDelete(query);
  
      if (!resultado) {
        return res.status(404).json({ mensaje: 'Dieta no encontrado' });
      }
  
      res.json({ mensaje: 'Dieta eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al eliminar el dieta', error });
      next(error);
    }
  };
  
  const SendDieta = async (req, res, next) => {
    try {
      const { user } = req.params;
  
      // Encuentra al usuario
      const usuario = await UsuarioModel.findOne({ user });
      if (!usuario) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
  
      // Verifica la suscripción del usuario
      if (usuario.dias_suscripcion <= 0) {
        return res.status(400).json({
          message: 'Suscripción expirada',
          alertMessage: 'Tu suscripción ha expirado. Por favor, renueva tu suscripción.',
          icon: 'warning'
        });
      }
  
      // Obtiene el tipo de dieta del usuario
      const tipo_dieta = usuario.tipo_dieta;
  
      // Busca la dieta correspondiente
      const dieta = await DietaModel.findOne({ nombreDietas: tipo_dieta });
      if (!dieta) {
        return res.status(404).json({ mensaje: 'Dieta no encontrada' });
      }
  
      // Desglosa la información de la dieta
      const dietaDesglosada = {
        nombreDietas: dieta.nombreDietas,
        objetivo: dieta.objetivo,
        sexo: dieta.sexo,
        caloriasDiarias: dieta.caloriasDiarias,
        distribucion_macronutrientes: dieta.distribucion_macronutrientes,
        semanas: dieta.mes.map(semana => ({
          numeroSemana: semana.numeroSemana,
          dias: semana.dias,
          comidas: {
            desayuno: semana.comidas.desayuno,
            almuerzo: semana.comidas.almuerzo,
            bocadillo: semana.comidas.bocadillo,
            cena: semana.comidas.cena,
            snackNoche: semana.comidas.snackNoche
          },
        })),
        consejo: dieta.consejo
      };
  
      // Responde con la dieta desglosada
      res.json(dietaDesglosada);
  
    } catch (error) {
      console.error('Error en la consulta de dieta:', error);
      next(error);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
  };

module.exports = {
    altaDieta, eliminarDietas, SendDieta
};