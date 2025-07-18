const express = require("express");
const cors = require("cors");
require('dotenv').config();

const path = require("path");


const app = express();

// Configuración de CORS
const corsOptions = {
   origin: '*', 
  methods: ["GET", "POST", "PUT", "DELETE"], // Limitar métodos permitidos

};
app.use(cors(corsOptions));


//hola que tal

// Middleware para parsear solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar modelos y sincronizar base de datos
const db = require("./app/models");
const Role = db.role;
const User = db.user;

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Conectado a la base de datos MySQL!');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  }
})();
// Sincronizar base de datos
db.sequelize.sync({alter: true}).then(() => {
  console.log("Database synchronized.");
  initial(); // Inicializar roles
}).catch(err => {
  console.error("Error synchronizing database:", err);
});

// Rutas
require("./app/routes/auth.routes")(app);
require("./app/routes/reservation.routes")(app);
require("./app/routes/space.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/activity.routes")(app);
require("./app/routes/userinfo.routes")(app);
require("./app/routes/trainer.routes")(app);
require("./app/routes/routines.routes/dietplan.routes")(app);
require("./app/routes/routines.routes/exerciseplan.routes")(app);
require("./app/routes/routines.routes/routine.routes")(app);
require("./app/controllers/schedule/schedule");

const PORT = process.env.PORT || 8080;

// Configurar puerto y escuchar solicitudes
app.listen(PORT, () => {
  const address = `http://${getLocalIp()}:${PORT}`;
  console.log(`Server is running at ${address}`);
});

function getLocalIp() {
  const os = require('os');
  const ifaces = os.networkInterfaces();
  let ip = 'localhost'; // Valor por defecto en caso de no encontrar la IP

  for (const iface in ifaces) {
    ifaces[iface].forEach(details => {
      if (details.family === 'IPv4' && !details.internal) {
        ip = details.address;
      }
    });
  }
  return ip;
}

// Función para inicializar roles
// Función para inicializar roles y usuarios
async function initial() {
  await Role.findOrCreate({ where: { id: 1 }, defaults: { name: "user" } });
  await Role.findOrCreate({ where: { id: 2 }, defaults: { name: "admin" } });
  await Role.findOrCreate({ where: { id: 3 }, defaults: { name: "trainer" } });

  const users = await User.findAll();
  if (users.length >= 10) {
    console.log("Ya existen suficientes usuarios.");
    return;
  }

  const bcrypt = require("bcryptjs");

  // Crea usuarios si no hay suficientes
  const userRole = await Role.findOne({ where: { name: "user" } });
  const adminRole = await Role.findOne({ where: { name: "admin" } });

  const existingUsernames = users.map(u => u.username);

  // Crear 2 administradores
  for (let i = 1; i <= 2; i++) {
    const username = `admin${i}`;
    if (!existingUsernames.includes(username)) {
      const admin = await User.create({
        name: `Admin ${i}`,
        username: username,
        birthday: "1990-01-01",
        email: `admin${i}@example.com`,
        password: bcrypt.hashSync("SuperAdmin",8),
        number: "600000000",
        dni: `0000000${i}A`,
        emailBlocked: false
      });
      await admin.setRoles([adminRole.id]);
      console.log(`Administrador ${username} creado.`);
    }
  }

  // Crear 8 usuarios normales
  for (let i = 1; i <= 8; i++) {
    const username = `user${i}`;
    if (!existingUsernames.includes(username)) {
      const user = await User.create({
        name: `User ${i}`,
        username: username,
        birthday: "1995-01-01",
        email: `user${i}@example.com`,
        password: bcrypt.hashSync("userpass", 8),
        number: "700000000",
        dni: `1000000${i}B`,
        emailBlocked: false
      });
      await user.setRoles([userRole.id]);
      console.log(`Usuario ${username} creado.`);
    }
  }
}
