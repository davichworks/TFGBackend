

module.exports = {
  HOST: "ballast.proxy.rlwy.net",
  USER: "root",
  PASSWORD: "ABuryFNriGmUGuiBqYgvsnyoeXWnixDg", 
  DB: "railway",
  PORT: 40079,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};