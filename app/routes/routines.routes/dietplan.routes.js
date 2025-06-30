const { authJwt } = require("../../middleware");
const dietPlanController = require("../../controllers/RController/dietplan.controller");


module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.post("/api/createDietPlan",[authJwt.verifyToken], dietPlanController.createDietPlan);

    app.get("/api/getDietPlans",[authJwt.verifyToken], dietPlanController.getDietPlans);

    app.get("/api/getDietPlan/:id", [authJwt.verifyToken], dietPlanController.getDietPlan);


    app.put("/api/updateDietPlan/:id",[authJwt.verifyToken, authJwt.isTrainer], dietPlanController.updateDietPlan);

    app.delete("/api/deleteDietPlan/:id",[authJwt.verifyToken, authJwt.isTrainer], dietPlanController.deleteDietPlan);


};