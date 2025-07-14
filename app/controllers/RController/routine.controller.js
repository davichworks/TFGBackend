const { Op } = require("sequelize");
const db = require('../../models');
const HealthRoutine = db.healthRoutine;
const DietPlan = db.dietPlan;
const ExercisePlan = db.exercisePlan;

exports.createHealthRoutine = async (req, res) => {
  const userId = req.userId;
  const creationDate = new Date();
  const {
    name,
    description,
    type,
    days,
    minAgeRecommendation,
    maxAgeRecommendation,
    minHeightRecommendation,
    maxHeightRecommendation,
    activityLevel,
    dietPlanIds = [],
    exercisePlanIds = []
  } = req.body;

  try {
    if (!Array.isArray(dietPlanIds) || !Array.isArray(exercisePlanIds)) {
      return res.status(400).json({ message: "dietPlanIds y exercisePlanIds deben ser arrays." });
    }
    const [dietPlans, exercisePlans] = await Promise.all([
      DietPlan.findAll({ where: { id: dietPlanIds } }),
      ExercisePlan.findAll({ where: { id: exercisePlanIds } })
    ]);

    if (dietPlans.length !== dietPlanIds.length || exercisePlans.length !== exercisePlanIds.length) {
      return res.status(404).json({ message: "Alguno de los dietPlanIds o exercisePlanIds no existe." });
    }
    const newRoutine = await HealthRoutine.create({
      userId,
      creationDate,
      name,
      description,
      type,
      days,
      minAgeRecommendation,
      maxAgeRecommendation,
      minHeightRecommendation,
      maxHeightRecommendation,
      activityLevel
    });
    await newRoutine.addDietPlans(dietPlanIds);
    await newRoutine.addExercisePlans(exercisePlanIds);

    // Incluir alias en el include
    const routineWithAssociations = await HealthRoutine.findByPk(newRoutine.id, {
      include: [
        { model: DietPlan, as: "dietPlans" },
        { model: ExercisePlan, as: "exercisePlans" }
      ]
    });

    res.status(201).json({
      message: "Rutina creada exitosamente.",
      routine: routineWithAssociations
    });
  } catch (error) {
    console.error("Error al crear la rutina:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener todas las rutinas
exports.getHealthRoutines = async (req, res) => {
  try {
    const routines = await HealthRoutine.findAll({
      include: [
        { model: DietPlan, as: "dietPlans" },
        { model: ExercisePlan, as: "exercisePlans" }
      ]
    });

    res.status(200).json({
      message: "Rutinas de salud encontradas.",
      routines
    });
  } catch (error) {
    console.error("Error al obtener las rutinas de salud:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Eliminar rutina
exports.deleteHealthRoutine = async (req, res) => {
  const { id } = req.params;

  try {
    const routine = await HealthRoutine.findByPk(id);

    if (!routine) {
      return res.status(404).json({ message: "Rutina no encontrada." });
    }

    await routine.destroy();

    res.status(200).json({ message: "Rutina eliminada exitosamente." });
  } catch (error) {
    console.error("Error al eliminar la rutina:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

exports.getRecommendedRoutines = async (req, res) => {
  const { goalType, days, age, height , activityLevel } = req.query;
  if (!goalType || !days || !age || !height || !activityLevel) {
    return res.status(400).json({ message: "Faltan parámetros: goalType, days, age o height." });
  }

  try {
    const routines = await HealthRoutine.findAll({
      where: {
        type: goalType,
        days: { [Op.lte]: days },
        minAgeRecommendation: { [Op.lte]: age },
        maxAgeRecommendation: { [Op.gte]: age },
        minHeightRecommendation: { [Op.lte]: height },
        maxHeightRecommendation: { [Op.gte]: height },
        activityLevel: activityLevel
      },
      include: [
        { model: DietPlan, as: "dietPlans" },
        { model: ExercisePlan, as: "exercisePlans" }
      ]
    });
console.log(JSON.stringify(routines, null, 2));

    if (!routines.length) {
      return res.status(404).json({ message: "No se encontraron rutinas recomendadas." });
    }

    routines.sort((a, b) => b.days - a.days);

    res.status(200).json({ message: "Rutinas recomendadas encontradas.", routines });
  } catch (error) {
    console.error("Error al obtener rutinas recomendadas:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Actualizar rutina existente
exports.updateHealthRoutine = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const {
    name,
    description,
    type,
    days,
    minAgeRecommendation,
    maxAgeRecommendation,
    minHeightRecommendation,
    maxHeightRecommendation,
    activityLevel,
    dietPlanIds = [],
    exercisePlanIds = []
  } = req.body;

  try {
    const routine = await HealthRoutine.findByPk(id);
    if (!routine) {
      return res.status(404).json({ message: "Rutina no encontrada." });
    }

    if (!Array.isArray(dietPlanIds) || !Array.isArray(exercisePlanIds)) {
      return res.status(400).json({ message: "dietPlanIds y exercisePlanIds deben ser arrays." });
    }

    const [dietPlans, exercisePlans] = await Promise.all([
      DietPlan.findAll({ where: { id: dietPlanIds } }),
      ExercisePlan.findAll({ where: { id: exercisePlanIds } })
    ]);

    if (dietPlans.length !== dietPlanIds.length || exercisePlans.length !== exercisePlanIds.length) {
      return res.status(404).json({ message: "Alguno de los dietPlanIds o exercisePlanIds no existe." });
    }

    await routine.update({
      userId,
      name,
      description,
      type,
      days,
      minAgeRecommendation,
      maxAgeRecommendation,
      minHeightRecommendation,
      maxHeightRecommendation,
      activityLevel
    });

    await routine.setDietPlans(dietPlanIds);
    await routine.setExercisePlans(exercisePlanIds);

    const updatedRoutine = await HealthRoutine.findByPk(id, {
      include: [
        { model: DietPlan, as: "dietPlans" },
        { model: ExercisePlan, as: "exercisePlans" }
      ]
    });

    res.status(200).json({ message: "Rutina actualizada exitosamente.", routine: updatedRoutine });
  } catch (error) {
    console.error("Error al actualizar la rutina:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

exports.saveRoutine = async (req, res) => {
  const userId = req.userId;
  const { routineId } = req.body;

  try {
    const user = await db.user.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const routine = await HealthRoutine.findByPk(routineId);
    if (!routine) {
      return res.status(404).json({ message: "Rutina no encontrada." });
    }

    const existingRoutine = await user.getSavedRoutines({ where: { id: routineId } });
    if (existingRoutine.length > 0) {
      return res.status(400).json({ message: "La rutina ya está guardada por el usuario." });
    }

    await user.addHealthRoutine(routineId);

    res.status(200).json({ message: "Rutina guardada exitosamente." });
  } catch (error) {
    console.error("Error al guardar la rutina:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

exports.getSavedRoutines = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await db.user.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const savedRoutines = await user.getSavedRoutines({
      include: [
        { model: DietPlan, as: "dietPlans" },
        { model: ExercisePlan, as: "exercisePlans" }
      ]
    });

    if (savedRoutines.length === 0) {
      return res.status(404).json({ message: "No hay rutinas guardadas." });
    }

    res.status(200).json({ message: "Rutinas guardadas encontradas.", routines: savedRoutines });
  } catch (error) {
    console.error("Error al obtener las rutinas guardadas:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

exports.deleteSavedRoutine = async (req, res) => {
  const userId = req.userId;
  const { routineId } = req.params;

  try {
    const user = await db.user.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const routine = await HealthRoutine.findByPk(routineId);
    if (!routine) {
      return res.status(404).json({ message: "Rutina no encontrada." });
    }

    await user.removeHealthRoutine(id);

    res.status(200).json({ message: "Rutina eliminada de los guardados exitosamente." });
  } catch (error) {
    console.error("Error al eliminar la rutina guardada:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

