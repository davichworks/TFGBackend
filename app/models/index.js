// Configuración de Sequelize 
const Sequelize = require("sequelize");
const config = require("../config/db.config.js");

const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle,
    },
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Modelos
db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.reservation = require("../models/reservation.model.js")(sequelize, Sequelize);
db.space = require("../models/space.model.js")(sequelize, Sequelize);
db.activity = require("../models/activity.model.js")(sequelize, Sequelize);
db.userInfo = require("../models/userinfo.model.js")(sequelize, Sequelize);
db.schedule = require("../models/schedule.model.js")(sequelize, Sequelize);
db.trainer = require("../models/trainer.model.js")(sequelize, Sequelize);
db.healthRoutine = require("../models/routinesmodels/healthroutine.model.js")(sequelize, Sequelize);
db.dietPlan = require("../models/routinesmodels/dietplan.model.js")(sequelize, Sequelize);
db.exercisePlan = require("../models/routinesmodels/exerciseplan.model.js")(sequelize, Sequelize);

// Relaciones entre tablas

// Roles y Usuarios (Muchos a Muchos)
db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId",
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId",
});

// Usuario -> Trainer (1 a 1)
db.user.hasOne(db.trainer, { foreignKey: 'userId', as: 'trainerProfile', onDelete: 'CASCADE' });
db.trainer.belongsTo(db.user, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });

// Trainer -> Activity (1 a N)
db.trainer.hasMany(db.activity, {
  foreignKey: "trainerId",
  as: "activities"
});
db.activity.belongsTo(db.trainer, {
  foreignKey: "trainerId",
  as: "trainer"
});

// Usuario -> UserInfo (1 a 1)
db.user.hasOne(db.userInfo, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.userInfo.belongsTo(db.user, { foreignKey: 'userId', onDelete: 'CASCADE' });

// Usuario -> Reservation (1 a N)
db.user.hasMany(db.reservation, { foreignKey: 'userId', as: 'reservations', onDelete: 'CASCADE' });
db.reservation.belongsTo(db.user, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });

// Polimórfica Reservation -> Activity | Space
db.reservation.belongsTo(db.activity, {
  foreignKey: 'reservableId',
  constraints: false,
  as: 'activity'
});
db.activity.hasMany(db.reservation, {
  foreignKey: 'reservableId',
  constraints: false,
  as: 'reservations'
});

db.reservation.belongsTo(db.space, {
  foreignKey: 'reservableId',
  constraints: false,
  as: 'space'
});
db.space.hasMany(db.reservation, {
  foreignKey: 'reservableId',
  constraints: false,
  as: 'reservations'
});

// Schedule polimórfico (relación genérica)
db.schedule.belongsTo(db.activity, {
  foreignKey: 'schedulableId',
  constraints: false,
  as: 'activity'
});
db.activity.hasMany(db.schedule, {
  foreignKey: 'schedulableId',
  constraints: false,
  as: 'schedules'
});

db.schedule.belongsTo(db.reservation, {
  foreignKey: 'schedulableId',
  constraints: false,
  as: 'reservation'
});
db.reservation.hasOne(db.schedule, {
  foreignKey: 'schedulableId',
  constraints: false,
  as: 'schedule'
});

db.schedule.belongsTo(db.space, {
  foreignKey: 'schedulableId',
  constraints: false,
  as: 'space'
});
db.space.hasMany(db.schedule, {
  foreignKey: 'schedulableId',
  constraints: false,
  as: 'schedules'
});

// Relaciones para HealthRoutine, DietPlan y ExercisePlan (Muchos a Muchos)
// Relaciones para HealthRoutine, DietPlan y ExercisePlan (Muchos a Muchos)
db.healthRoutine.belongsToMany(db.dietPlan, {
  through: "HealthRoutine_DietPlans",
  as: "dietPlans",            // alias necesario para métodos como addDietPlans
  foreignKey: "healthRoutineId",
  otherKey: "dietPlanId"
});
db.dietPlan.belongsToMany(db.healthRoutine, {
  through: "HealthRoutine_DietPlans",
  as: "healthRoutines",
  foreignKey: "dietPlanId",
  otherKey: "healthRoutineId"
});

db.healthRoutine.belongsToMany(db.exercisePlan, {
  through: "HealthRoutine_ExercisePlans",
  as: "exercisePlans",        // alias necesario para métodos como addExercisePlans
  foreignKey: "healthRoutineId",
  otherKey: "exercisePlanId"
});
db.exercisePlan.belongsToMany(db.healthRoutine, {
  through: "HealthRoutine_ExercisePlans",
  as: "healthRoutines",
  foreignKey: "exercisePlanId",
  otherKey: "healthRoutineId"
});


db.ROLES = ["user", "admin", "trainer"];

module.exports = db;
