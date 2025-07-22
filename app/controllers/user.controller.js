const db = require("../models");
const User = db.user;
const Role = db.role;
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { Sequelize } = db;


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          where: {
            name: {
              [Sequelize.Op.or]: ["user", "trainer"]  
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
exports.getTrainers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          where: {
            name: {
              [Sequelize.Op.or]: [ "trainer"] 
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
  
  exports.deleteUser = async (req, res) => {
    const {id} = req.body;
    try {
      
      const user = await User.findByPk(id);
  
      if (user) {
        await user.destroy();
        res.status(200).send({ message: "Usuario Borrado!" });
      } else {
        res.status(404).send({ message: `No se puede eliminar =${email}.!` });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

exports.getPublicContent = async (req, res) => {
  res.status(200).json({
    welcome: "Bienvenido a Salesport App",
    description:
      "Tu centro de entrenamiento y bienestar. Reserva espacios, actividades y gestiona tu rutina.",
    features: [
      "Reserva espacios y actividades fácilmente.",
      "Gestiona tus reservas y perfil.",
      "Accede a rutinas personalizadas y seguimiento de salud.",
      "Disfruta de la comunidad Salesport.",
    ],
  });
};
  
  exports.blockEmail = async (req, res) => {
    const {id} = req.body;
    
    try {
      
      const user = await User.findByPk(id);
      if (user) {
        user.emailBlocked = !user.emailBlocked;
        await user.save();
        res.status(200).send({ message: "Usuario bloqueadi!" });
      } else {
        res.status(404).send({ message: "No se puede bloquear al usuario" });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  exports.changePassword = async (req, res) => {
    try {
      const userId = req.userId;
      const newPassword = req.body.newPassword;
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).send({
          message: "Usuario no encontrado."
        });
      }
      
      user.password = bcrypt.hashSync(newPassword, 8);
      
      await user.save();
   
      res.status(200).send({ message: "La contraseña fue actualizada exitosamente!" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  exports.updateUser = async (req, res) => {
    const userId = req.userId;
    const { name, username,birthday ,email,number,dni } = req.body;
  
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      user.name = name,
      user.username = username,
      user.bithday = birthday,
      user.email = email,
      user.number = parseInt(number, 10); 

      user.dni = dni,
  
      await user.save();
  
      res.status(200).json(user);
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };

  
 
  exports.createTrainer = async (req, res) => {
    try {
      const { id } = req.body;
      const user = await User.findByPk(id);
  
      if (!user) {
        return res.status(404).send({ message: `No se puede encontrar al usuario con id =${id}.` });
      }
  
      const role = await Role.findOne({ where: { name: "trainer" } });
      const hasRole = await user.hasRole(role);
      const trainerProfile = await user.getTrainerProfile();
  
      if (hasRole) {

        await user.removeRole(role);
  

        if (trainerProfile) {
          const history = trainerProfile.history || [];
          history.push({ date: new Date().toISOString(), action: 'demoted' });
          trainerProfile.history = history;
          trainerProfile.active = false;
          await trainerProfile.save();
        }
        return res.status(200).send({ message: "Usuario borrado de entrenador" });

      } else {

        await user.addRole(role);
  
        if (trainerProfile) {

          const history = trainerProfile.history || [];
          history.push({ date: new Date().toISOString(), action: 'promoted' });
          trainerProfile.history = history;
          trainerProfile.active = true;
          await trainerProfile.save();
        } else {
          await db.trainer.create({
            userId: user.id,
            name: user.name,
            username: user.username,
            history: [{ date: new Date().toISOString(), action: 'promoted' }],
            active: true
          });
        }
        return res.status(200).send({ message: "Usuario promocionado correctamente!" });
      }
  
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };
  


  