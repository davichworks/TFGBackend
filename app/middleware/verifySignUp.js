const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    const { username, email, number, dni } = req.body;

    const checks = [
      { field: 'username', value: username, message: 'Usuario en uso.' },
      { field: 'email', value: email, message: 'Email en uso', extra: { emailBlocked: false } },
      { field: 'number', value: number, message: 'Número en uso.' },
      { field: 'dni', value: dni, message: 'DNI en uso.' },
    ];

    for (const check of checks) {
      const where = { [check.field]: check.value, ...(check.extra || {}) };
      const existing = await User.findOne({ where });

      if (existing) {
        return res.status(400).send({ message: `error! ${check.message}` });
      }
    }

    next();
  } catch (error) {
    console.error("Error :", error);
    return res.status(500).send({ message: "Internal server error." });
  }
};

checkDuplicateUsernameOrEmail2 = async (req, res, next) => {
  try {
    const { username, email, number, dni } = req.body;
    const id = req.userId
    const usernameUser = await User.findOne({ where: { username } });
    if (usernameUser && usernameUser.id !== id) {
      return res.status(400).send({ message: "Failed! Usuario en uso" });
    }

    const emailUser = await User.findOne({ where: { email, emailBlocked: false } });
    if (emailUser && emailUser.id !== id) {
      return res.status(400).send({ message: "Failed! Email bloqueado." });
    }

    const numberUser = await User.findOne({ where: { number } });
    if (numberUser && numberUser.id !== id) {
      return res.status(400).send({ message: "Failed! Numero en uso." });
    }

    const dniUser = await User.findOne({ where: { dni } });
    if (dniUser && dniUser.id !== id) {
      return res.status(400).send({ message: "Failed! DNI en uso." });
    }

    next();
  } catch (error) {
    console.error("Error chequeando duplicados:", error);
    return res.status(500).send({ message: "Internal server error." });
  }
};


        verify = (req, res, next) => {
          const { name, username, birthday, dni, number, email } = req.body;

          if (!name || !/^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]{2,50}$/.test(name)) {
            return res.status(400).send({
              message: "Failed! Nombre contiene caracteres inválidos."
            });
          }

          let parsedBirthday;

          if (/^\d{4}-\d{2}-\d{2}/.test(birthday)) {
            parsedBirthday = new Date(birthday);
          } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(birthday)) {
            const [day, month, year] = birthday.split("/");
            parsedBirthday = new Date(`${year}-${month}-${day}`);
          } else {
            return res.status(400).send({
              message: "Failed!  Cumpleaños debe estar en el formato adecuado."
            });
          }

          const now = new Date();
          const minDate = new Date();
          minDate.setFullYear(now.getFullYear() - 99);

          const maxDate = new Date();
          maxDate.setFullYear(now.getFullYear() - 16);

          if (
            isNaN(parsedBirthday) ||
            parsedBirthday < minDate ||
            parsedBirthday > maxDate
          ) {
            return res.status(400).send({
              message: "Failed! Cumpleaños debe estar en el formato adecuado"
            });
          }

          if (!dni || !/^\d{8}[A-Z]$/.test(dni)) {
            return res.status(400).send({
              message: "Failed! Dni no válido"
            });
          }

          if (!number || !/^\d{9}$/.test(number)) {
            return res.status(400).send({
              message: "Failed! Número no valido."
            });
          }

          if (!username || !/^[a-zA-Z0-9_\-]{4,20}$/.test(username)) {
            return res.status(400).send({
              message: "Failed! Usuario no válido."
            });
          }

          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).send({
              message: "Failed! Email es incorrecto."
            });
          }

          next();
        };
        
checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Rol ${req.body.roles[i]} no existe.`
        });
        return;
      }
    }
  }
  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
  checkDuplicateUsernameOrEmail2: checkDuplicateUsernameOrEmail2,
  checkRolesExisted: checkRolesExisted,
  verify: verify
};

module.exports = verifySignUp;
