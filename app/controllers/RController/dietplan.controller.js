const db = require("../../models");
const DietPlan = db.dietPlan;

exports.createDietPlan = async (req, res) => {
  try {
    const newPlan = await DietPlan.create(req.body);
    res.status(201).json({ newPlan, message: 'Plan de dieta creado exitosamente' });
  } catch (error) {
    console.error('Error al crear el plan de dieta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getDietPlans = async (req, res) => {
  try {
    const plans = await DietPlan.findAll();
    res.status(200).json(plans);
  } catch (error) {
    console.error('Error al obtener los planes de dieta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getDietPlan = async (req, res) => {
  try {
    const plan = await DietPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan no encontrado' });
    res.status(200).json(plan);
  } catch (error) {
    console.error('Error al obtener el plan de dieta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.updateDietPlan = async (req, res) => {
  try {
    const plan = await DietPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan no encontrado' });

    await plan.update(req.body);
    res.status(200).json({ plan, message: 'Plan de dieta actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el plan de dieta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.deleteDietPlan = async (req, res) => {
  try {
    const plan = await DietPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan no encontrado' });

    await plan.destroy();
    res.status(200).json({ message: 'Plan de dieta eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el plan de dieta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};