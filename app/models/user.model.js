module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    birthday: {
      type: Sequelize.DATE,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    number: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    dni: {
      type: Sequelize.STRING,
      allowNull: false
    },
    emailBlocked: {
      type: Sequelize.BOOLEAN,
      defaultValue: false 
    },
    membershipExpiryDate: {
      type: Sequelize.DATE,
      allowNull: true,
    }
  });

  return User;
};
