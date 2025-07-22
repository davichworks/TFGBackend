const cron = require('node-cron');
const db = require('./../../models');
const Reservation = db.reservation;
const { Op, Sequelize } = db.Sequelize;

const cancelExpiredReservations = async () => {
  try {
    const now = new Date();
    now.setHours(now.getHours() + 2);

    const allActiveReservations = await Reservation.findAll({
       where: {
        state: { [Op.not]: 'pendiente' }
      }
    });
    
    const expiredReservations = allActiveReservations.filter(r => {
      const endDateTime = new Date(`${r.specificDate}T${r.endTime}`);
     
      return endDateTime < now;
    });
    if (expiredReservations.length === 0) {
      return;
    }

    const idsToCancel = expiredReservations.map(r => r.id);
    const result = await Reservation.update(
      {
        state: 'expirada',
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

cron.schedule('* * * * *', () => {
  console.log('Ejecutando cancelación de reservas expiradas...');
  cancelExpiredReservations();
});
