const Sequelize = require("sequelize");
const config = require("../config/db.config.js");

const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    port: config.PORT,
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

// Aquí tus modelos (igual que en tu código)
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

// Relaciones (igual que en tu código)
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

db.user.hasOne(db.trainer, { foreignKey: 'userId', as: 'trainerProfile', onDelete: 'CASCADE' });
db.trainer.belongsTo(db.user, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });

db.trainer.hasMany(db.activity, {
  foreignKey: "trainerId",
  as: "activities"
});
db.activity.belongsTo(db.trainer, {
  foreignKey: "trainerId",
  as: "trainer"
});

db.user.hasOne(db.userInfo, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.userInfo.belongsTo(db.user, { foreignKey: 'userId', onDelete: 'CASCADE' });

db.user.hasMany(db.reservation, { foreignKey: 'userId', as: 'reservations', onDelete: 'CASCADE' });
db.reservation.belongsTo(db.user, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });

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


db.user.belongsToMany(db.healthRoutine, {
  through: 'UserRoutine',  
  as: 'savedRoutines',      
  foreignKey: 'userId',
  otherKey: 'healthRoutineId',
  onDelete: 'CASCADE',
});

db.healthRoutine.belongsToMany(db.user, {
  through: 'UserRoutine',   
  as: 'usersSaved',        
  foreignKey: 'healthRoutineId',
  otherKey: 'userId',
  onDelete: 'CASCADE',
});

db.healthRoutine.belongsToMany(db.dietPlan, {
  through: "HealthRoutine_DietPlans",
  as: "dietPlans",
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
  as: "exercisePlans",
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
