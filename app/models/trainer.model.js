module.exports = (sequelize, Sequelize) => {
    const Trainer = sequelize.define("trainers", {
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true
          },
        name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: true
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull: true
      },
      daysofWeek:{
        type: Sequelize.JSON, 
        allowNull: true
      },
      history: {
        type: Sequelize.JSON, // 
        defaultValue: []
      },
  
      active: { 
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    });

    
  
    return Trainer;
  };
  