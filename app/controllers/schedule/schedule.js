const cron = require('node-cron');
const db = require('./../../models');
const Reservation = db.reservation;
const { Op, Sequelize } = db.Sequelize;

const cancelExpiredReservations = async () => {
  try {
    const now = new Date();

    const allActiveReservations = await Reservation.findAll({
       where: {
        state: { [Op.not]: 'cancelada' }
      }
    });
    
    const expiredReservations = allActiveReservations.filter(r => {
      const endDateTime = new Date(`${r.specificDate}T${r.endTime}`);
      console.log('empieza la reserva de',r.id);
      console.log("comienza lo de reservas");
    console.log('el now es',now);
    console.log('el specificDate es',specificDate);
    console.log('el endTime es',endTime);
      return endDateTime < now;
    });

    if (expiredReservations.length === 0) {
      console.log('No hay reservas expiradas para cancelar.');
      return;
    }

    const idsToCancel = expiredReservations.map(r => r.id);

    const result = await Reservation.update(
      {
        state: 'cancelada',
        updatedAt: new Date()
      },
      {
        where: { id: { [Op.in]: idsToCancel } }
      }
    );

    console.log(`Reservas expiradas canceladas: ${result[0]}`);
  } catch (error) {
    console.error('Error cancelando reservas expiradas:', error);
  }
};

// Ejecutar cada minuto
cron.schedule('* * * * *', () => {
  console.log('⏰ Ejecutando tarea de cancelación de reservas expiradas...');
  cancelExpiredReservations();
});
