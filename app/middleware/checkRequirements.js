const db = require("../models");
const bcrypt = require("bcryptjs");
const User = db.user;
const Activity = db.activity;
const Space = db.space;
const Trainer = db.trainer;

checkPasswordRequirements = async (req, res, next) => {
  const { oldPassword, confirmOldPassword, newPassword } = req.body;
  
  if (oldPassword !== confirmOldPassword) {
    return res.status(400).send({
      message: "Las contraseñas antiguas no coinciden."
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).send({
      message: "La nueva contraseña debe tener al menos 6 caracteres."
    });
  }
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({
        message: "Usuario no encontrado."
      });
    }
    const passwordIsValid = bcrypt.compareSync(oldPassword, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({
        message: "Contraseña antigua incorrecta."
      });
    }
    next();
  } catch (error) {
    return res.status(500).send({
      message: "Error interno del servidor."
    });
  }
};


checkReservationRequirements = async (req, res, next) => {
  const { reservableType, reservableId, schedule } = req.body;

  try {
    const validTypes = ['activity', 'trainer', 'space'];
    if (!validTypes.includes(reservableType)) {
      return res.status(400).json({ message: 'Tipo de recurso inválido.' });
    }

    let resourceModel = null;
    let includeOptions = [];

    if (reservableType === 'activity') {
      resourceModel = Activity;
      includeOptions = [{ model: Schedule, as: 'schedules' }];
    } else if (reservableType === 'space') {
      resourceModel = Space;
      includeOptions = [{ model: Schedule, as: 'schedules' }];
    } else if (reservableType === 'trainer') {
      resourceModel = Trainer;
    }

    const resource = await resourceModel.findByPk(reservableId, {
      include: includeOptions
    });

    if (!resource) {
      return res.status(404).json({ message: `${reservableType} no encontrado.` });
    }

    if (!schedule || !schedule.startTime || !schedule.endTime || !schedule.isSingle) {
      return res.status(400).json({ message: "El horario (schedule) está incompleto o es inválido." });
    }

   if (reservableType === 'activity' || reservableType === 'space') {
  if (resource.capacity <= 0) {
    return res.status(400).json({ message: `La capacidad del ${reservableType} debe ser mayor a 0.` });
  }

  if (!Array.isArray(resource.schedules) || resource.schedules.length === 0) {
    return res.status(400).json({ message: `No hay horarios disponibles para este ${reservableType}.` });
  }

  const userDay = schedule.dayOfWeek;
  const userSpecificDate = schedule.specificDate;
  const userStart = schedule.startTime;
  const userEnd = schedule.endTime;

  const match = resource.schedules.find(s => {
    if (s.isSingle) {
      return (
        s.specificDate === userSpecificDate &&
        userStart >= s.startTime &&
        userEnd <= s.endTime
      );
    } else {
      return (
        s.dayOfWeek === userDay &&
        userStart >= s.startTime &&
        userEnd <= s.endTime
      );
    }
  });

  if (!match) {
    return res.status(400).json({ message: "El horario no está disponible para este recurso." });
  }
}     else if (reservableType === 'trainer') {
      const days = resource.daysOfWeek || []; 
      const isDayAvailable = days.includes(schedule.dayOfWeek);

      if (!isDayAvailable) {
        return res.status(400).json({ message: "El día solicitado no está disponible para este entrenador." });
      }

      if (
        schedule.startTime < resource.startTime ||
        schedule.endTime > resource.endTime
      ) {
        return res.status(400).json({ message: "El horario está fuera del rango del entrenador." });
      }
    }

    next(); // Todo OK
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Error interno del servidor al verificar la reserva."
    });
  }
};

// Función para verificar los requisitos del email
checkEmailRequirements = async (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).send({
      message: "El email no es válido."
    });
  }

  try {
    const user = await User.findOne({ where: { email: email } });

    if (user) {
      return res.status(400).send({
        message: "El email ya está en uso."
      });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      message: "Error interno del servidor."
    });
  }
};

// Función para verificar los requisitos del nombre de usuario
checkUsernameRequirements = async (req, res, next) => {
  const { username } = req.body;

  if (username.length < 3) {
    return res.status(400).send({
      message: "El nombre de usuario debe tener al menos 3 caracteres."
    });
  }

  try {
    const user = await User.findOne({ where: { username: username } });

    if (user) {
      return res.status(400).send({
        message: "El nombre de usuario ya está en uso."
      });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      message: "Error interno del servidor."
    });
  }
};

checkUserInfoRequirements = async (req, res, next) => {
  const { gender, age, peso, altura, cadera, cintura, lvl } = req.body;

  try {

    if (!gender || !['male', 'female'].includes(gender)) {
      return res.status(400).send({
        message: "El género debe ser 'Masculino' o 'Femenino'."
      });
    }

    if (!age || isNaN(age) || age < 12 || age > 99) {
      return res.status(400).send({
        message: "La edad debe ser un número válido entre 18 y 99."
      });
    }

    if (!peso || isNaN(peso) || peso < 25 || peso > 400) {
      return res.status(400).send({
        message: "El peso debe ser un número válido"
      });
    }

    if (!altura || isNaN(altura) || altura < 120 || altura > 250) {
      return res.status(400).send({
        message: "La altura debe ser un número válido mayor que cero."
      });
    }

    if (cadera && (isNaN(cadera) || cadera <50 || cadera > 180)) {
      return res.status(400).send({
        message: "La circunferencia de cadera debe ser un número válido mayor que cero."
      });
    }

    if (cintura && (isNaN(cintura) || cintura < 40 || cintura > 160)) {
      return res.status(400).send({
        message: "La circunferencia de cintura debe ser un número válido mayor que cero."
      });
    }
    if (!lvl || !['low', 'medium', 'high'].includes(lvl)) {
      return res.status(400).send({
        message: "El nivel debe ser 'Principiante', 'Intermedio' o 'Avanzado'."
      });
    }

    next();
  } catch (error) {
    console.error("Error al verificar los requisitos de la información del usuario:", error);
    return res.status(500).send({
      message: "Error interno del servidor al verificar los requisitos de la información del usuario."
    });
  }
};


const checkRequirements = {
  checkPasswordRequirements: checkPasswordRequirements,
  checkEmailRequirements: checkEmailRequirements,
  checkUsernameRequirements: checkUsernameRequirements,
  checkUserInfoRequirements: checkUserInfoRequirements,
  checkReservationRequirements: checkReservationRequirements
};

module.exports = checkRequirements;
