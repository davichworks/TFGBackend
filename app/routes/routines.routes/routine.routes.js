const { authJwt } = require("../../middleware");
const routineController = require("../../controllers/RController/routine.controller");


module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.post("/api/createHealthRoutine",[authJwt.verifyToken , authJwt.isTrainer], routineController.createHealthRoutine);

    app.get("/api/getHealthRoutines",[authJwt.verifyToken], routineController.getHealthRoutines);

    //app.get("/api/getRoutine/:id", [authJwt.verifyToken], routineController.getRoutine);

   // app.get("/api/getUserRoutines", [authJwt.verifyToken], routineController.getUserRoutines);
 //app.get("/api/getTrainerRoutines", [authJwt.verifyToken, authJwt.isTrainer], routineController.getTrainerRoutines);

    app.get('/api/getRecommendedRoutines', [authJwt.verifyToken], routineController.getRecommendedRoutines);
    

    app.put("/api/updateHealthRoutine/:id",[authJwt.verifyToken, authJwt.isTrainer], routineController.updateHealthRoutine);

   
     app.delete("/api/deleteHealthRoutine",[authJwt.verifyToken, authJwt.isTrainer], routineController.deleteHealthRoutine);

    app.post("/api/saveRoutine", [authJwt.verifyToken], routineController.saveRoutine);

    app.get("/api/getSavedRoutines", [authJwt.verifyToken], routineController.getSavedRoutines);

    app.delete("/api/deleteSavedRoutine", [authJwt.verifyToken],routineController.deleteSavedRoutine);

    

};
