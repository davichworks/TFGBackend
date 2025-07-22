const db = require("../models");
const UserInfo = db.userInfo;
const { Op } = require("sequelize");


const calculateIMC = (peso, altura) => peso && altura ? peso / ((altura / 100) ** 2) : null;

const calculatePGC = (gender, cintura, cadera, altura) => {
  if (!gender || !cintura || !cadera || !altura) return null;
  return gender === "male"
    ? 98.42 - (0.082 * cintura) + (0.001 * cintura * cadera) - (0.006 * (altura / 100))
    : 76.76 - (0.082 * cintura) + (0.001 * cintura * cadera) - (0.006 * (altura / 100));
};

const calculateCC = (gender, peso, altura, age, pgc) => {
  if (!gender || !peso || !altura || !age || !pgc) return null;
  let factor = gender === "male" ? (10 * peso) + (6.25 * altura) - (5 * age) + 5
                                 : (10 * peso) + (6.25 * altura) - (5 * age) - 161;
  return factor * (100 - pgc) / 100;
};


exports.getUserInfo = async (req, res) => {
  const userId = req.userId;

  try {
    const latestUserInfo = await UserInfo.findOne({
      where: { userId },
      order: [['fechaActualizacion', 'DESC']] 
    });

    if (!latestUserInfo) {
      return res.status(200).json({ message: "Sin datos, Por favor rellene el formulario" });
    }

    res.status(200).json(latestUserInfo);
  } catch (error) {
    console.error("Error al obtener la información de usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.getUserHistory = async (req, res) => {
  const userId = req.userId;
  try {
    const userHistory = await UserInfo.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']] 
    });

    if (!userHistory.length) {
      return res.status(200).json({ message: "Sin datos, Por favor rellene el formulario" });
    }

    res.status(200).json(userHistory);
  } catch (error) {
    console.error("Error al obtener el historial de usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.createUserInfo = async (req, res) => {
  const userId = req.userId; 
  const { gender, age, peso, altura, cadera, cintura, lvl } = req.body;

  try {
    const imc = calculateIMC(peso, altura);
    const pgc = calculatePGC(gender, cintura, cadera, altura);
    const cc = calculateCC(gender, peso, altura, age, pgc);

    const newUserInfo = await UserInfo.create({
      userId,
      gender,
      age,
      peso,
      altura,
      cadera,
      cintura,
      imc,
      pgc,
      cc,
      lvl
    });

    res.status(201).json(newUserInfo);
  } catch (error) {
    console.error("Error al crear la información de usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
