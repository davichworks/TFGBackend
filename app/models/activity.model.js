module.exports = (sequelize, Sequelize) => {
    const Activity = sequelize.define("activity", {
      
      classname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        allowNull:false
      },
      description: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      monitor: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });

    return Activity;
  };
  