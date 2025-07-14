const { user } = require("..");

module.exports = (sequelize, Sequelize) => {

const ExercisePlan = sequelize.define("exerciseplan", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: Sequelize.INTEGER, allowNull: false },
  exercises: { type: Sequelize.TEXT, allowNull: false } 
},
{
    tableName: "exerciseplan", 
    freezeTableName: true       //
  });


  return ExercisePlan;
  };
