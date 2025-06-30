module.exports = (sequelize, Sequelize) => {
    const Reservation = sequelize.define("reservation", {
      // Definición de campos de la tabla "reservations"
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: { 
    type: Sequelize.INTEGER,
    allowNull: false
  },
  reservableId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  reservableType: {
    type: Sequelize.STRING,
    allowNull: false
  },
      state: {
        type: Sequelize.ENUM('pendiente', 'cancelada', 'finalizada'),
        allowNull: false,
        defaultValue: 'pendiente'
    } });
    
  
    return Reservation;
  };
  