
module.exports = (sequelize, Sequelize) => {
    const Space = sequelize.define("space", {
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  
    return Space;
  };
  