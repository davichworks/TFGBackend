const { authJwt , verifySpaceActivity } = require("../middleware");
const activityController = require("../controllers/activity.controller");


module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.get("/api/getActivities",[authJwt.verifyToken], activityController.getActivities);

    app.get("/api/getActivity/:id", [authJwt.verifyToken],activityController.getActivity);

    app.post("/api/createActivity",[authJwt.verifyToken, authJwt.isAdmin, verifySpaceActivity.verifyActivity], activityController.createActivity);

    app.put("/api/updateActivity/:id",[authJwt.verifyToken, authJwt.isAdmin, verifySpaceActivity.verifyActivity], activityController.updateActivity);

    app.delete("/api/deleteActivity/:id",[authJwt.verifyToken, authJwt.isAdmin], activityController.deleteActivity);

    

};