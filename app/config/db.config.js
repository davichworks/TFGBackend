require('dotenv').config();

module.exports = {
  HOST: process.env.MYSQLHOST || 'localhost',
  USER: process.env.MYSQLUSER || 'root',
  PASSWORD: process.env.MYSQLPASSWORD || '',
  DB: process.env.MYSQLDATABASE || 'railway',
  PORT: process.env.MYSQLPORT || 3306,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};