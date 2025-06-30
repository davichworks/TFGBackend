const { authJwt  } = require("../middleware");
const trainerController = require("../controllers/trainer.controller");
const { checkRequirements } = require("../middleware");



module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  
  app.get("/api/getTrainers ", [authJwt.verifyToken], trainerController.getTrainers);

  app.post("/api/asignarHorario", [authJwt.verifyToken, authJwt.isTrainer], trainerController.asignarHorario);



};
