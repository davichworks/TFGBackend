const db = require("../models");
const { Op } = require("sequelize");

const Reservation = db.reservation;
const Activity = db.activity;
const Space = db.space;
const Schedule = db.schedule;

const availability = async (req, res, next) => {
  const { reservableType, reservableId, specificDate, startTime, endTime } = req.body;
  const userId = req.userId;
  try {
    if (!['activity', 'space'].includes(reservableType)) {
      return res.status(400).json({ message: 'Tipo de recurso inválido.' });
    }

    if (!specificDate || !startTime || !endTime) {
      return res.status(400).json({ message: 'Fecha y horas son requeridas.' });
    }

    const now = new Date();
    now.setHours(now.getHours() + 2);
    const startDateTime = new Date(`${specificDate}T${startTime}`);
    const endDateTime = new Date(`${specificDate}T${endTime}`);

    if (startDateTime <= now || endDateTime <= now) {
      return res.status(400).json({ message: 'La reserva debe ser en el futuro.' });
    }

    if (startDateTime >= endDateTime) {
      return res.status(400).json({ message: 'La hora de inicio debe ser menor que la de fin.' });
    }

    let resource;
    if (reservableType === 'activity') {
      resource = await Activity.findByPk(reservableId);
    } else {
      resource = await Space.findByPk(reservableId, {
        include: [{ model: Schedule, as: 'schedules' }]
      });
    }

    if (!resource) {
      return res.status(404).json({ message: `${reservableType} no encontrado.` });
    }

    if (reservableType === 'space') {
      const toMinutes = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };

      const startMinutes = toMinutes(startTime);
      const endMinutes = toMinutes(endTime);

      const isWithinAvailableSchedule = resource.schedules.some(sch => {
        const schStart = toMinutes(sch.startTime);
        const schEnd = toMinutes(sch.endTime);
        return startMinutes >= schStart && endMinutes <= schEnd;
      });

      if (!isWithinAvailableSchedule) {
        return res.status(400).json({
          message: 'El horario está fuera del rango permitido para este espacio.'
        });
      }
    }

    const overlappingReservations = await Reservation.findAll({
      where: {
        reservableId,
        reservableType,
        specificDate,
        state: { [Op.ne]: 'cancelada' },
        [Op.or]: [
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gt]: startTime }
          }
        ]
      }
    });
   
    if (overlappingReservations.length >= resource.capacity) {
      return res.status(400).json({ message: 'No hay disponibilidad para este horario.' });
    }

    const existingUserReservation = await Reservation.findOne({
      where: {
        userId,
        reservableId,
        reservableType,
        specificDate,
        state: { [Op.ne]: 'cancelada' },
        [Op.or]: [
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gt]: startTime }
          }
        ]
      }
    });

    if (existingUserReservation) {
      return res.status(400).json({
        message: 'Ya tienes una reserva activa para este recurso en esa fecha.'
      });
    }

    next();
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({ message: 'Error al verificar disponibilidad' });
  }
};

module.exports = availability;
