const db = require('../models');
const Reservation = db.reservation;
const Space = db.space;
const Activity = db.activity;
const { Op } = require('sequelize');

// Obtener todas las reservaciones
exports.getReservations = async (req, res) => {
  try {
    const reservation = await Reservation.findAll({
      include: [
        { model: Space, as: 'space' },
        { model: Activity, as: 'activity' }
      ]
    });
    res.status(200).json(reservation);
  } catch (error) {
    console.error('Error al obtener las reservaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener reservaciones del usuario en estado "pendiente"
exports.getReservation = async (req, res) => {
  console.log('getReservation called');
  const userId = req.userId;
  try {
    const reservation = await Reservation.findAll({
  where: {
    userId: userId,
    
    reservableType: {
      [Op.in]: ['space', 'activity']  // o el tipo que esperes
    }
  },
  include: [
    {
      model: db.space,
      as: 'space',
      required: false,
    },
    {
      model: db.activity,
      as: 'activity',
      required: false,
    }
  ]
});
    console.log('Reservations found:');
    res.status(200).json(reservation);
  } catch (error) {
    console.error('Error al obtener las reservaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.createReservation = async (req, res) => {
  const { reservableType, reservableId, specificDate, startTime, endTime } = req.body;
  const userId = req.userId;

  try {
    const validTypes = ['activity', 'space'];
    if (!validTypes.includes(reservableType)) {
      console.log("recurso invalido");
      return res.status(400).json({ message: 'Tipo de recurso inválido.' });
    }

    const Model = reservableType === 'activity' ? Activity : Space;
    const resource = await Model.findByPk(reservableId);
    if (!resource) {
      return res.status(404).json({ message: `${reservableType} no encontrado.` });
    }
    if (resource.cantidad <= 0) {
            console.log("cantidad invalida");

      return res.status(400).json({ message: 'No hay disponibilidad para este recurso.' });
    }

    const reservation = await Reservation.create({
      userId,
      reservableId,
      reservableType,
      specificDate,
      startTime,
      endTime,
      state: 'pendiente'
    });

    
    res.status(201).json({
      reservation,
      message: 'Reserva creada exitosamente con su horario'
    });
  } catch (error) {
    console.error('Error al crear la reserva:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar una reservación y su horario
exports.updateReservation = async (req, res) => {
  const { id } = req.params;
  const { reservableType, reservableId, specificDate, startTime,endTime,state } = req.body;

  try {
    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (reservableType && !['activity', 'space'].includes(reservableType)) {
      return res.status(400).json({ message: 'Tipo de recurso inválido.' });
    }

    if (reservableType && reservableId) {
      const Model = reservableType === 'activity' ? Activity : Space;
      const resource = await Model.findByPk(reservableId);
      if (!resource) {
        return res.status(404).json({ message: `${reservableType} no encontrado.` });
      }
      reservation.specificDate = specificDate;
      reservation.startTime = startTime ;
      reservation.endTime = endTime ;
      reservation.reservableType = reservableType;
      reservation.reservableId = reservableId;
    }

    if (state) {
      reservation.state = state;
    }

    await reservation.save();


    res.status(200).json({
      message: 'Reserva actualizada correctamente',
      reservation
    });
  } catch (error) {
    console.error('Error al actualizar la reserva:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.deleteReservation = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const reservation = await Reservation.findOne({
      where: { id, userId }
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservación no encontrada' });
    }
    if (reservation.state === 'cancelada') {
      return res.status(400).json({ message: 'La reservación ya está cancelada' });
    }

    const Model = reservation.reservableType === 'activity' ? Activity : Space;
    const resource = await Model.findByPk(reservation.reservableId);
    if (!resource) {
      return res.status(404).json({ message: `${reservation.reservableType} no encontrado.` });
    }
    reservation.state = 'cancelada';
    await reservation.save();

    

    res.status(200).json({ message: 'Reservación cancelada exitosamente' });
  } catch (error) {
    console.error('Error al cancelar la reservación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
