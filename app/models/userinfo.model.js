// Define el modelo UserInfo
module.exports = (sequelize, Sequelize) => {
  const UserInfo = sequelize.define("userInfo", { // Cambié a camelCase para consistencia
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    gender: {
      type: Sequelize.ENUM('male', 'female'),
      allowNull: false,
      defaultValue: 'male'
    },
    age: {
      type: Sequelize.INTEGER
    },
    peso: {
      type: Sequelize.FLOAT // Peso del usuario
    },
    altura: {
      type: Sequelize.FLOAT // Altura del usuario
    },
    cadera: {
      type: Sequelize.FLOAT // Medida de cadera del usuario
    },
    cintura: {
      type: Sequelize.FLOAT // Medida de cintura del usuario
    },
    imc: {
      type: Sequelize.FLOAT // Índice de Masa Corporal
    },
    pgc: {
      type: Sequelize.FLOAT // Porcentaje de Grasa Corporal
    },
    cc: {
      type: Sequelize.FLOAT // Consumo Calórico
    },
    lvl: {
      type: Sequelize.ENUM('low', 'medium', 'high'), // Nivel de actividad física
      allowNull: false,
      defaultValue: 'medium'
    },
    fechaActualizacion: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  });

  return UserInfo;
};
