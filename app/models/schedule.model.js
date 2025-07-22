module.exports = (sequelize, Sequelize) => {
    const Schedule = sequelize.define("schedule", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      dayOfWeek: { 
        type: Sequelize.ENUM('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'),
        allowNull: false,
      },
      isSingle: { 
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      schedulableId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
       schedulableType: { 
    type: Sequelize.ENUM( 'activity', 'space'),
    allowNull: false
  },
      specificDate: { 
        type: Sequelize.DATEONLY,
        allowNull: true,
      }
    });
  
    return Schedule;
  };
  