
module.exports = (sequelize, Sequelize) => {
  const UserInfo = sequelize.define("userInfo", { 
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
      type: Sequelize.FLOAT 
    },
    altura: {
      type: Sequelize.FLOAT 
    },
    cadera: {
      type: Sequelize.FLOAT 
    },
    cintura: {
      type: Sequelize.FLOAT 
    },
    imc: {
      type: Sequelize.FLOAT 
    },
    pgc: {
      type: Sequelize.FLOAT 
    },
    cc: {
      type: Sequelize.FLOAT 
    },
    lvl: {
      type: Sequelize.ENUM('low', 'medium', 'high'), 
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
