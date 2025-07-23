const bcrypt = require("bcryptjs");
const db = require("../app/models");

const Role = db.role;
const User = db.user;
const Trainer = db.trainer;
const DietPlan = db.dietPlan;
const ExercisePlan = db.exercisePlan;
const HealthRoutine = db.healthRoutine;
const Space = db.space;
const Activity = db.activity;
const Schedule = db.schedule;

const initializeData = async () => {
  console.log("Inicializando datos...");

  // --- Roles ---
  await Role.findOrCreate({ where: { id: 1 }, defaults: { name: "user" } });
  await Role.findOrCreate({ where: { id: 2 }, defaults: { name: "admin" } });
  await Role.findOrCreate({ where: { id: 3 }, defaults: { name: "trainer" } });

  // --- Usuarios base ---
  const users = await User.findAll();
  const existingUsernames = users.map(u => u.username);
  const userRole = await Role.findOne({ where: { name: "user" } });
  const adminRole = await Role.findOne({ where: { name: "admin" } });
  const trainerRole = await Role.findOne({ where: { name: "trainer" } });

  // Crear administradores
  for (let i = 1; i <= 2; i++) {
    const username = `admin${i}`;
    if (!existingUsernames.includes(username)) {
      const admin = await User.create({
        name: `Admin ${i}`,
        username,
        birthday: "1990-01-01",
        email: `admin${i}@example.com`,
        password: bcrypt.hashSync("SuperAdmin", 8),
        number: "600000000",
        dni: `0000000${i}A`,
        emailBlocked: false,
      });
      await admin.setRoles([adminRole.id]);
      console.log(`Administrador ${username} creado.`);
    }
  }

  // Crear usuarios estándar
  for (let i = 1; i <= 8; i++) {
    const username = `user${i}`;
    if (!existingUsernames.includes(username)) {
      const user = await User.create({
        name: `User ${i}`,
        username,
        birthday: "1995-01-01",
        email: `user${i}@example.com`,
        password: bcrypt.hashSync("userpass", 8),
        number: "700000000",
        dni: `1000000${i}B`,
        emailBlocked: false,
      });
      await user.setRoles([userRole.id]);
      console.log(`Usuario ${username} creado.`);
    }
  }

  // --- Crear monitores (trainers) ---
  const trainerUsernames = ['user1', 'user2', 'user3'];
  for (const username of trainerUsernames) {
    const user = await User.findOne({ where: { username } });
    if (user) {
      await user.addRole(trainerRole);
      const existingTrainer = await Trainer.findOne({ where: { userId: user.id } });
      if (!existingTrainer) {
        await Trainer.create({
          userId: user.id,
          name: user.name,
          username: user.username,
          startTime: "08:00:00",
          endTime: "18:00:00",
          daysofWeek: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
          history: [{ date: new Date().toISOString(), action: "promoted" }],
          active: true,
        });
        console.log(`Monitor creado para ${user.username}`);
      }
    }
  }

  // --- Crear espacios ---
  const spaceData = [
    { name: "Sala de Pesas", capacity: 30, location: "Primer Piso" },
    { name: "Sala de Yoga", capacity: 20, location: "Segundo Piso" },
  ];
  const spaces = [];
  for (const s of spaceData) {
    const [space] = await Space.findOrCreate({ where: { name: s.name }, defaults: s });
    spaces.push(space);
  }

  // --- Crear actividades ---
  const trainers = await Trainer.findAll();
  const activityData = [
    {
      classname: "CrossFit",
      location: "Sala de Pesas",
      description: "Entrenamiento funcional de alta intensidad",
      capacity: 15,
      monitor: trainers[0]?.name || "Monitor1",
    },
    {
      classname: "Yoga Avanzado",
      location: "Sala de Yoga",
      description: "Clase de yoga para avanzados",
      capacity: 10,
      monitor: trainers[1]?.name || "Monitor2",
    },
  ];
  const activities = [];
  for (const a of activityData) {
    const [activity] = await Activity.findOrCreate({ where: { classname: a.classname }, defaults: a });
    activities.push(activity);
  }

  // --- Crear horarios ---
  const date = "2025-07-30";
  const schedulesData = [];

  spaces.forEach(space => {
    schedulesData.push({
      startTime: "09:00:00",
      endTime: "11:00:00",
      dayOfWeek: "Miércoles",
      isSingle: true,
      schedulableId: space.id,
      schedulableType: "space",
      specificDate: date,
    });
    schedulesData.push({
      startTime: "17:00:00",
      endTime: "19:00:00",
      dayOfWeek: "Miércoles",
      isSingle: true,
      schedulableId: space.id,
      schedulableType: "space",
      specificDate: date,
    });
  });

  activities.forEach(activity => {
    schedulesData.push({
      startTime: "10:00:00",
      endTime: "12:00:00",
      dayOfWeek: "Miércoles",
      isSingle: true,
      schedulableId: activity.id,
      schedulableType: "activity",
      specificDate: date,
    });
    schedulesData.push({
      startTime: "18:00:00",
      endTime: "20:00:00",
      dayOfWeek: "Miércoles",
      isSingle: true,
      schedulableId: activity.id,
      schedulableType: "activity",
      specificDate: date,
    });
  });

  for (const s of schedulesData) {
    await Schedule.findOrCreate({
      where: {
        startTime: s.startTime,
        endTime: s.endTime,
        dayOfWeek: s.dayOfWeek,
        schedulableId: s.schedulableId,
        schedulableType: s.schedulableType,
        specificDate: s.specificDate,
      },
      defaults: s,
    });
  }

  // --- Crear trainers con dietPlans, exercisePlans y rutinas ---
  for (let i = 1; i <= 2; i++) {
    const username = `trainer${i}`;
    let user = await User.findOne({ where: { username } });
    if (!user) {
      user = await User.create({
        name: `Trainer ${i}`,
        username,
        birthday: "1985-01-01",
        email: `${username}@example.com`,
        password: bcrypt.hashSync("trainerpass", 8),
        number: "600000000",
        dni: `9000000${i}T`,
        emailBlocked: false,
      });
      await user.setRoles([trainerRole.id]);
      console.log(`Usuario ${username} creado.`);
    }

    let trainer = await Trainer.findOne({ where: { userId: user.id } });
    if (!trainer) {
      trainer = await Trainer.create({
        userId: user.id,
        name: user.name,
        username: user.username,
        startTime: "08:00:00",
        endTime: "18:00:00",
        daysofWeek: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
        history: [{ date: new Date().toISOString(), action: "promoted" }],
        active: true,
      });
      console.log(`Trainer creado para ${user.username}`);
    }

    // Crear planes
    const dietPlans = [];
    const exercisePlans = [];
    for (let j = 1; j <= 7; j++) {
      const diet = await DietPlan.create({
        userId: user.id,
        kcal: 2000 + j * 100,
        protein: 150 + j * 5,
        carbs: 200 + j * 10,
        fats: 70 + j * 2,
        breakfast: `Desayuno ${j}: 2 huevos, 1 taza avena, 1 banana`,
        lunch: `Almuerzo ${j}: 200g pollo, 100g arroz integral, ensalada mixta`,
        dinner: `Cena ${j}: 150g salmón, 150g quinoa, verduras al vapor`,
        snacks: `Snack ${j}: 30g nueces, 1 yogur griego`,
      });
      dietPlans.push(diet);

      const exercises = `**Biceps y Espalda**\n- Flexión de bíceps 3x12\n- Dominadas 3x10\n- Remo con barra 4x8\n\n**Piernas y Core**\n- Sentadillas 4x12\n- Peso muerto rumano 3x10\n- Plancha abdominal 3x60s`;
      const exercise = await ExercisePlan.create({
        userId: user.id,
        exercises: exercises,
      });
      exercisePlans.push(exercise);
    }

    // Crear rutinas
    for (let r = 1; r <= 2; r++) {
      const routine = await HealthRoutine.create({
        creationDate: new Date(),
        userId: user.id,
        name: `Rutina ${r} de ${user.username}`,
        description: `Rutina completa con planes de dieta y entrenamiento para ${user.username}`,
        type: "mantenimiento",
        days: 4,
        minAgeRecommendation: 18,
        maxAgeRecommendation: 60,
        minHeightRecommendation: 150,
        maxHeightRecommendation: 200,
        activityLevel: "moderado",
        totaldays: 7,
      });

      await routine.addDietPlans(dietPlans);
      await routine.addExercisePlans(exercisePlans.slice(0, 4));

      console.log(`Rutina ${r} creada para ${user.username}`);
    }
  }

  console.log("Datos iniciales creados correctamente.");
};

module.exports = { initializeData };
