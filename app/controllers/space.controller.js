const db = require('../models');
const Space = db.space;
const Schedule = db.schedule;


exports.createSpace = async (req, res) => {
  const { name, capacity, location, schedules } = req.body;

  try {
    const spaceData = {
      name,
      capacity,
      location
    };
    const newSpace = await Space.create(spaceData);

    if (schedules && schedules.length > 0) {
      const schedulePromises = schedules.map(schedule => {
        return Schedule.create({
          ...schedule,
          schedulableId: newSpace.id, 
          schedulableType: 'space'
        });
      });
      await Promise.all(schedulePromises);
    }

    res.status(201).json({ newSpace, message: 'Espacio y horarios creados exitosamente' });
  } catch (error) {
    console.error('Error al crear el espacio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


exports.getSpaces = async (req, res) => {
  try {
    const spaces = await Space.findAll({
      include: {
        model: Schedule,
        as: 'schedules',
        where: { schedulableType: 'space' },
        required: false
      }
    });
    res.status(200).json(spaces);
  } catch (error) {
    console.error('Error al obtener los espacios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getSpace = async (req, res) => {
  const { id } = req.params;

  try {
    const space = await Space.findByPk(id, {
      include: {
        model: Schedule,
        as: 'schedules'  
      }
    });

    if (!space) {
      return res.status(404).json({ message: 'Espacio no encontrado' });
    }
    res.status(200).json(space);
  } catch (error) {
    console.error('Error al obtener el espacio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.updateSpace = async (req, res) => {
  const { id } = req.params;
  const { name, capacity, location, schedules } = req.body;

  try {
    const space = await Space.findByPk(id);
    if (!space) {
      return res.status(404).json({ message: 'Espacio no encontrado' });
    }

    space.name = name;
    space.capacity = capacity;
    space.location = location;

    await space.save();

    if (schedules && schedules.length > 0) {
      await Schedule.destroy({
        where: {
          schedulableId: space.id,
          schedulableType: 'space'
        }
      });
      const schedulePromises = schedules.map(schedule => {
        return Schedule.create({
          ...schedule,
          schedulableId: space.id,  
          schedulableType: 'space' 
        });
      });
      await Promise.all(schedulePromises);
    }

    res.status(200).json(space);
  } catch (error) {
    console.error('Error al actualizar el espacio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


exports.deleteSpace = async (req, res) => {
  const { id } = req.params;

  try {
    const space = await Space.findByPk(id);
    if (!space) {
      return res.status(404).json({ message: 'Espacio no encontrado' });
    }

   
    await Schedule.destroy({
      where: {
        schedulableId: space.id,
        schedulableType: 'space'
      }
    });

    await space.destroy();

    res.status(200).json({ message: 'Espacio eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el espacio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
