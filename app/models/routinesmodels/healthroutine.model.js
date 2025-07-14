
module.exports = (sequelize, Sequelize) => {
    const HealthRoutine = sequelize.define("healthroutine", {
      // Definición de campos de la tabla "reservations"
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      creationDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    type: {
        type: Sequelize.ENUM('adelgazar', 'mantenimiento', 'aumentar masa muscular', 'tonificar','volumen'),
        allowNull: false
    },
    days: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    minAgeRecommendation: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    maxAgeRecommendation: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    minHeightRecommendation: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    maxHeightRecommendation: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    activityLevel: {
  type: Sequelize.ENUM('sedentario', 'moderado', 'activo'),
  allowNull: false
},
totaldays: {
    type:Sequelize.INTEGER,
    allowNull: false
},

});
  
    return HealthRoutine;
  };
  