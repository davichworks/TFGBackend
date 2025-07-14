const db = require("../../models");
const ExercisePlan = db.exercisePlan;
// Crear un nuevo plan de ejercicios

exports.createExercisePlan = async (req, res) => {
  try {
    const { exercises } = req.body;
    const userId = req.userId; 
    console.log("Received exercises:", exercises);
   
    if ( !exercises) {
      return res.status(400).send({ message: "Faltan campos requeridos." });
    }
    console.log("Creating new exercise plan with exercises:", exercises);
    const newPlan = await ExercisePlan.create({userId,
      exercises: typeof exercises === "object" ? JSON.stringify(exercises) : exercises
    });
    console.log("New exercise plan created:", newPlan);

    res.status(201).send(newPlan);
  } catch (err) {
    console.error("Error creating exercise plan:", err);

    res.status(500).send({ message: err.message || "Error al crear el plan de ejercicios." });
  }
};


exports.getExercisePlans = async (req, res) => {
  try {
    const plans = await ExercisePlan.findAll();
    res.status(200).send(plans);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener los planes de ejercicios." });
  }
};

// Obtener un plan de ejercicios por ID
exports.getExercisePlan = async (req, res) => {
  try {
    const id = req.params.id;
    const plan = await ExercisePlan.findByPk(id);

    if (!plan) {
      return res.status(404).send({ message: "Plan de ejercicios no encontrado." });
    }

    res.status(200).send(plan);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al obtener el plan de ejercicios." });
  }
};

// Actualizar un plan de ejercicios por ID
exports.updateExercisePlan = async (req, res) => {
  try {
    const id = req.params.id;
    const { exercises } = req.body;

    const [updated] = await ExercisePlan.update(
      {
        
        exercises: typeof exercises === "object" ? JSON.stringify(exercises) : exercises
      },
      { where: { id } }
    );

    if (updated === 0) {
      return res.status(404).send({ message: "No se encontró el plan o no se realizaron cambios." });
    }

    const updatedPlan = await ExercisePlan.findByPk(id);
    res.status(200).send(updatedPlan);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al actualizar el plan de ejercicios." });
  }
};

// Eliminar un plan de ejercicios por ID
exports.deleteExercisePlan = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await ExercisePlan.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).send({ message: "Plan de ejercicios no encontrado." });
    }

    res.status(200).send({ message: "Plan de ejercicios eliminado correctamente." });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al eliminar el plan de ejercicios." });
  }
};
