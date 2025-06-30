module.exports = (sequelize, Sequelize) => {

const ExercisePlan = sequelize.define("exerciseplan", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  exercises: { type: Sequelize.TEXT, allowNull: false } // puedes usar JSON o string largo para guardar varios ejercicios
},
{
    tableName: "exerciseplan", 
    freezeTableName: true       //
  });


  return ExercisePlan;
  };
