const db = require("../models");
const Schedule = db.schedule;
const Activity = db.activity;
const Reservation = db.reservation;
const Space = db.space;
const { Op } = require('sequelize');

const availability = async (req, res, next) => {
  const { reservableType, reservableId, schedule } = req.body;

  try {
    const validTypes = ['activity', 'space'];
    if (!validTypes.includes(reservableType)) {
      return res.status(400).json({ message: 'Tipo de recurso inválido.' });
    }

    let resource = null;

    if (reservableType === 'activity') {
      resource = await Activity.findByPk(reservableId);
    } else if (reservableType === 'space') {
      resource = await Space.findByPk(reservableId, {
        include: [{ model: Schedule, as: 'schedules' }] // Asegúrate que 'schedules' es el alias correcto en tu modelo
      });
    }

    if (!resource) {
      return res.status(404).json({ message: `${reservableType} no encontrado.` });
    }

    const {
      startTime,
      endTime,
      specificDate,
      dayOfWeek = null,
      isSingle
    } = schedule;

    const now = new Date();
    const scheduleStart = new Date(`${specificDate}T${startTime}`);
    const scheduleEnd = new Date(`${specificDate}T${endTime}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (scheduleStart <= now || scheduleEnd <= now) {
      return res.status(400).json({ message: 'La fecha y hora de la reserva deben ser futuras.' });
    }

    // Función para convertir hh:mm:ss a minutos
    const toMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    if (reservableType === 'activity') {
      if (resource.cantidad <= 0) {
        return res.status(400).json({ message: 'No hay disponibilidad para esta actividad.' });
      }
    }

    if (reservableType === 'space') {
      const startMinutes = toMinutes(startTime);
      const endMinutes = toMinutes(endTime);
      const schedules = resource.schedules || [];

      // Validar que el horario solicitado esté dentro de alguno de los horarios disponibles del espacio
      const isWithinAnySchedule = schedules.some(sch => {
        const schStart = toMinutes(sch.startTime);
        const schEnd = toMinutes(sch.endTime);
        return startMinutes >= schStart && endMinutes <= schEnd;
      });

      if (!isWithinAnySchedule) {
        return res.status(400).json({
          message: 'El horario de reserva está fuera del horario disponible del espacio.'
        });
      }

      // Validar que la fecha no sea pasada
      const inputDate = new Date(specificDate);
      inputDate.setHours(0, 0, 0, 0);
      if (inputDate < today) {
        return res.status(400).json({ message: 'No se puede reservar en fechas pasadas.' });
      }

      // Construir condición para horarios
      const scheduleWhere = isSingle
        ? {
            isSingle: true,
            specificDate,
            startTime,
            endTime
          }
        : {
            isSingle: false,
            dayOfWeek,
            startTime,
            endTime
          };

      const overlappingReservations = await Reservation.findAll({
        where: {
          reservableId,
          reservableType: 'space',
          state: { [Op.not]: 'cancelada' }
        },
        include: [{
          model: Schedule,
          as: 'schedule',
          where: scheduleWhere
        }]
      });

      if (overlappingReservations.length >= resource.cantidad) {
        return res.status(400).json({ message: 'El espacio está completamente reservado para ese horario.' });
      }
    }

    next();
  } catch (error) {
    console.error('Error en verificación de disponibilidad:', reservableType, reservableId, error);
    res.status(500).json({ message: 'Error al verificar disponibilidad' });
  }
};

module.exports = availability;
