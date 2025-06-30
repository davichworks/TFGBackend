
const db = require('../models');
const Activity = db.activity;
const Reservation = db.reservation;
const Space = db.space;
const { Sequelize } = db;
const Schedule = db.schedule;
const Trainer = db.trainer;



exports.createActivity = async (req, res) => {
  const { classname, location, description, capacity, monitor, schedules } = req.body;

  try {
    
    const activityData = {
      classname,
      location,
      description,
      capacity,
      monitor,
      state: 'pendiente',
    };
    const newActivity = await Activity.create(activityData);
    if (schedules && schedules.length > 0) {
      const schedulePromises = schedules.map(schedule => {
        return Schedule.create({
          ...schedule,
          schedulableId: newActivity.id,
          schedulableType: 'activity'
        });
      });

      await Promise.all(schedulePromises);
    }

    res.status(201).json({ newActivity, message: 'Actividad creada con horarios' });
  } catch (error) {
    console.error('Error al crear la actividad:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.findAll({
      include: [{
        model: Schedule,
        as: 'schedules',
        where: { schedulableType: 'activity' },
        required: false
      }],
    });

    res.status(200).json(activities);
  } catch (error) {
    console.error('Error al obtener las actividades:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await Activity.findByPk(id, {
      include: [{
        model: Schedule,
        as: 'schedules'
      }]
    });

    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    res.status(200).json(activity);
  } catch (error) {
    console.error('Error al obtener la actividad:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};



// Actualizar una actividad por su ID
exports.updateActivity = async (req, res) => {
  const { id } = req.params;
  const { classname, location, description, capacity, monitor, schedules } = req.body;
  console.log('ID de la actividad:', id);
  try {
    // Buscar la actividad
    const activity = await Activity.findByPk(id, {
      include: [{ model: Schedule, as: 'schedules' }]
    });

    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    // Actualizar los datos de la actividad
    activity.classname = classname;
    activity.location = location;
    activity.description = description;
    activity.capacity = capacity;
    activity.monitor = monitor;

    await activity.save();

    // Si se proporciona el array de horarios
    if (schedules && schedules.length > 0) {
      // Eliminar los horarios antiguos
      await Schedule.destroy({ where: { schedulableId: id , schedulableType: 'activity' } });

      // Crear los nuevos horarios
      const schedulePromises = schedules.map(schedule => {
        return Schedule.create({
          ...schedule,
          schedulableId: activity.id,
          schedulableType: 'activity'
        });
      });

      await Promise.all(schedulePromises);
    }

    res.status(200).json({ activity, message: 'Actividad y horarios actualizados exitosamente' });
  } catch (error) {
    console.error('Error al actualizar la actividad:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};



// Eliminar un espacio por su ID
exports.deleteActivity = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar la actividad
    const activity = await Activity.findByPk(id, {
      include: [{ model: Schedule, as: 'schedules' }]
    });

    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    // Eliminar todos los horarios asociados
    await Schedule.destroy({ where: { schedulableId: id , schedulableType: 'activity'} });

    // Eliminar la actividad
    await activity.destroy();

    res.status(200).json({ message: 'Actividad y horarios eliminados exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la actividad:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

