const db = require("../models");
const User = db.user;
const Role = db.role;
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { Sequelize } = db;
const { Trainer } = db;

exports.getTrainers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          where: {
            name: {
              [Sequelize.Op.or]: ["trainer"]  
            }
          },
          attributes: ['name'] 
        }
      ]
    });
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};



exports.asignarHorario = async (req, res) => {
  const { startTime, endTime, daysOfWeek } = req.body;
  const trainerId = req.userId;

  try {
    const trainer = await Trainer.findByPk(trainerId);

    if (!trainer) {
      return res.status(404).send({ message: "Trainer no encontrado" });
    }

    trainer.startTime = startTime;
    trainer.endTime = endTime;
    trainer.daysOfWeek = daysOfWeek;

    await trainer.save();

    res.status(200).send({
      message: "Horario asignado exitosamente al trainer",
      trainer
    });

  } catch (error) {
    console.error('Error al asignar el horario:', error);
    res.status(500).send({ message: 'Error interno del servidor' });
  }
};


