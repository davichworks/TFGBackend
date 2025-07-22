const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { initializeData } = require("./app/inicializar");
const path = require("path");


const app = express();

const corsOptions = {
   origin: '*', 
  methods: ["GET", "POST", "PUT", "DELETE"], 

};
app.use(cors(corsOptions));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
db.sequelize.sync({alter: true}).then(() => {
  console.log("Database synchronized.");
  initial(); 
}).catch(err => {
  console.error("Error synchronizing database:", err);
});


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

app.listen(PORT, () => {
  const address = `http://${getLocalIp()}:${PORT}`;
  console.log(`Server is running at ${address}`);
});

function getLocalIp() {
  const os = require('os');
  const ifaces = os.networkInterfaces();
  let ip = 'localhost'; 

  for (const iface in ifaces) {
    ifaces[iface].forEach(details => {
      if (details.family === 'IPv4' && !details.internal) {
        ip = details.address;
      }
    });
  }
  return ip;
}


async function initial() {
 
(async () => {
  try {
    await initializeData();
  } catch (err) {
    console.error("Error inicializando datos:", err);
  }
})();
}
