module.exports = (sequelize, Sequelize) => {
    const Reservation = sequelize.define("reservation", {
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
  specificDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    startTime: {
        type: Sequelize.TIME,
        allowNull: false
    },
    endTime: {
      type:Sequelize.TIME,
      allowNull: false
    },
      state: {
        type: Sequelize.ENUM('pendiente', 'cancelada', 'finalizada'),
        allowNull: false,
        defaultValue: 'pendiente'
    } });
    
  
    return Reservation;
  };
  