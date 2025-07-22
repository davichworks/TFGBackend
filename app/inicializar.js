const bcrypt = require("bcryptjs");
const db = require("../app/models");

const { Role, User, Trainer, Space, Activity, Schedule, DietPlan, ExercisePlan, HealthRoutine } = db;

const initializeData = async () => {
    console.log("Inicializando datos...");
  // Roles
  await Role.findOrCreate({ where: { id: 1 }, defaults: { name: "user" } });
  await Role.findOrCreate({ where: { id: 2 }, defaults: { name: "admin" } });
  await Role.findOrCreate({ where: { id: 3 }, defaults: { name: "trainer" } });

  // Usuarios existentes
  const users = await User.findAll();
  if (users.length >= 10) {
    console.log("Ya existen suficientes usuarios.");
    return;
  }

  const userRole = await Role.findOne({ where: { name: "user" } });
  const adminRole = await Role.findOne({ where: { name: "admin" } });
  const trainerRole = await Role.findOne({ where: { name: "trainer" } });

  const existingUsernames = users.map(u => u.username);

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

  // Crear monitores (trainers) para usuarios user1, user2, user3 (existentes)
  const usersForTrainers = await User.findAll({ where: { username: ['user1', 'user2', 'user3'] }});
  for (const user of usersForTrainers) {
    const existingTrainer = await Trainer.findOne({ where: { userId: user.id } });
    if (!existingTrainer) {
      await Trainer.create({
        userId: user.id,
        name: user.name,
        username: user.username,
        startTime: "08:00:00",
        endTime: "18:00:00",
        daysofWeek: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        history: [],
        active: true,
      });
      console.log(`Monitor creado para ${user.username}`);
    }
  }

  // Crear espacios
  const spaceData = [
    { name: "Sala de Pesas", capacity: 30, location: "Primer Piso" },
    { name: "Sala de Yoga", capacity: 20, location: "Segundo Piso" },
  ];

  const spaces = [];
  for (const s of spaceData) {
    const [space] = await Space.findOrCreate({ where: { name: s.name }, defaults: s });
    spaces.push(space);
  }

  // Crear actividades asignando un monitor al azar
  const trainers = await Trainer.findAll();
  const activityData = [
    { classname: "CrossFit", location: "Sala de Pesas", description: "Entrenamiento intenso", capacity: 15, monitor: trainers[0]?.name || "Monitor1" },
    { classname: "Yoga Avanzado", location: "Sala de Yoga", description: "Clase de yoga para avanzados", capacity: 10, monitor: trainers[1]?.name || "Monitor2" },
  ];

  const activities = [];
  for (const a of activityData) {
    const [activity] = await Activity.findOrCreate({ where: { classname: a.classname }, defaults: a });
    activities.push(activity);
  }

  // Crear schedules para espacios y actividades para la fecha 30/07/2025
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

  // --- Aquí empieza la creación que pediste: 2 trainers + planes + rutinas ---

  const createdTrainers = [];
  for (let i = 1; i <= 2; i++) {
    // Crear usuario trainer si no existe
    let user = await User.findOne({ where: { username: `trainer${i}` } });
    if (!user) {
      user = await User.create({
        name: `Trainer ${i}`,
        username: `trainer${i}`,
        birthday: "1985-01-01",
        email: `trainer${i}@example.com`,
        password: bcrypt.hashSync("trainerpass", 8),
        number: "600000000",
        dni: `9000000${i}T`,
        emailBlocked: false,
      });
      await user.setRoles([trainerRole.id]);
      console.log(`Usuario trainer${i} creado.`);
    }

    // Crear Trainer si no existe
    let trainer = await Trainer.findOne({ where: { userId: user.id } });
    if (!trainer) {
      trainer = await Trainer.create({
        userId: user.id,
        name: user.name,
        username: user.username,
        startTime: "08:00:00",
        endTime: "18:00:00",
        daysofWeek: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
        history: [],
        active: true,
      });
      console.log(`Trainer creado para ${user.username}`);
    }

    createdTrainers.push({ user, trainer });
  }

  // Para cada trainer crear 7 dietPlans y 7 exercisePlans, y luego 2 rutinas con 4 días (4 exercisePlans y 7 dietPlans)
  for (const { user, trainer } of createdTrainers) {
    const dietPlans = [];
    const exercisePlans = [];

    for (let i = 1; i <= 7; i++) {
      const dietPlan = await DietPlan.create({
        userId: user.id,
        kcal: 2000 + i * 50,
        protein: 150,
        carbs: 200,
        fats: 70,
        breakfast: `Desayuno ${i}`,
        lunch: `Almuerzo ${i}`,
        dinner: `Cena ${i}`,
        snacks: `Snack ${i}`,
      });
      dietPlans.push(dietPlan);

      const exercisePlan = await ExercisePlan.create({
        userId: user.id,
        exercises: `Ejercicios del plan ${i}`,
      });
      exercisePlans.push(exercisePlan);
    }

    for (let r = 1; r <= 2; r++) {
      const days = 4; // rutina de 4 días

      // Seleccionar 4 exercisePlans para la rutina (los primeros 4)
      const selectedExercisePlans = exercisePlans.slice(0, days);
      // Para dietPlans, usamos los 7 completos
      const selectedDietPlans = dietPlans;

      const healthRoutine = await HealthRoutine.create({
        creationDate: new Date(),
        userId: user.id,
        name: `Rutina ${r} de ${user.username}`,
        description: `Rutina de ${days} días creada para ${user.username}`,
        type: "mantenimiento",
        days, // 4 días
        minAgeRecommendation: 18,
        maxAgeRecommendation: 60,
        minHeightRecommendation: 150,
        maxHeightRecommendation: 200,
        activityLevel: "moderado",
        totaldays: 7,
      });

      // Asociar planes
      await healthRoutine.addDietPlans(selectedDietPlans);
      await healthRoutine.addExercisePlans(selectedExercisePlans);

      console.log(`Rutina ${r} creada para ${user.username} con ${selectedDietPlans.length} dietPlans y ${selectedExercisePlans.length} exercisePlans.`);
    }
  }

  console.log("Datos iniciales creados correctamente.");
};

module.exports = { initializeData };
