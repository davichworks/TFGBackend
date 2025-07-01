const cron = require('node-cron');
const db = require('./../../models');
const Reservation = db.reservation;
const { Op, Sequelize } = db.Sequelize;

const cancelExpiredReservations = async () => {
  try {
    const now = new Date();

    const expiredReservations = await Reservation.findAll({
      where: {
        state: { [Op.not]: 'cancelada' },
        [Op.and]: Sequelize.where(
          Sequelize.literal("STR_TO_DATE(CONCAT(`specificDate`, ' ', `endTime`), '%Y-%m-%d %H:%i:%s')"),
          { [Op.lt]: now }
        )
      },
      attributes: ['id'],
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
