const { authJwt } = require("../../middleware");
const exercisePlanController = require("../../controllers/RController/exerciseplan.controller");


module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.post("/api/createExercisePlan",[authJwt.verifyToken, authJwt.isTrainer], exercisePlanController.createExercisePlan);

    app.get("/api/getExercisePlans",[authJwt.verifyToken, authJwt.isTrainer], exercisePlanController.getExercisePlans);

    app.get("/api/getExercisePlan/:id", [authJwt.verifyToken, authJwt.isTrainer], exercisePlanController.getExercisePlan);


    app.put("/api/updateExercisePlan/:id",[authJwt.verifyToken, authJwt.isTrainer], exercisePlanController.updateExercisePlan);

    app.delete("/api/deleteExercisePlan/:id",[authJwt.verifyToken, authJwt.isTrainer], exercisePlanController.deleteExercisePlan);


};