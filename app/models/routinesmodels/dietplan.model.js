module.exports = (sequelize, Sequelize) => {
    

const DietPlan = sequelize.define("dietplan", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  kcal: { type: Sequelize.INTEGER, allowNull: false },
  protein: { type: Sequelize.INTEGER, allowNull: false },
  carbs: { type: Sequelize.INTEGER, allowNull: false },
  fats: { type: Sequelize.INTEGER, allowNull: false },
  breakfast: { type: Sequelize.STRING, allowNull: false },
  lunch: { type: Sequelize.STRING, allowNull: false },
  dinner: { type: Sequelize.STRING, allowNull: false },
  snacks: { type: Sequelize.STRING }
});

  
    return DietPlan;
  };
  