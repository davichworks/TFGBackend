const cron = require('node-cron');
const db = require('./../../models');
const Reservation = db.reservation;
const Schedule = db.schedule;
const { Op, Sequelize } = db.Sequelize;


const cancelExpiredReservations = async () => {
  try {
    const now = new Date();

    const expiredReservations = await Reservation.findAll({
      where: {
        state: { [Op.notIn]: ['cancelada'] },
      },
      include: [{
        model: Schedule,
        as: 'schedule',
        required: true,
        where: Sequelize.where(
          Sequelize.literal("STR_TO_DATE(CONCAT(`schedule`.`specificDate`, ' ', `schedule`.`startTime`), '%Y-%m-%d %H:%i:%s')"),
          { [Op.lt]: now }
        )
      }],
      attributes: ['id'],
    });

    if (expiredReservations.length === 0) {
      console.log('No hay reservas expiradas para cancelar.');
      return;
    }

    const idsToCancel = expiredReservations.map(r => r.id);

    const result = await Reservation.update(
      { state: 'cancelada', updatedAt: new Date() },
      {
        where: { id: idsToCancel }
      }
    );

    console.log(`Reservas expiradas canceladas: ${result[0]}`);

  } catch (error) {
    console.error('Error cancelando reservas expiradas:', error);
  }
};

// Ejecutar cada minuto
cron.schedule('* * * * *', () => {
  console.log('Ejecutando tarea de cancelación de reservas expiradas...');
  cancelExpiredReservations();
});
