const { authJwt, verifySpaceActivity } = require("../middleware");
const spaceController = require("../controllers/space.controller");



module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.get("/api/getSpaces", spaceController.getSpaces);

    app.get("/api/getSpace/:id", [authJwt.verifyToken],spaceController.getSpace);

    app.post("/api/createSpace",[authJwt.verifyToken, authJwt.isAdmin, verifySpaceActivity.verifySpace], spaceController.createSpace);

    app.put("/api/updateSpace/:id",[authJwt.verifyToken, authJwt.isAdmin, verifySpaceActivity.verifySpace ], spaceController.updateSpace);

    app.delete("/api/deleteSpace/:id",[authJwt.verifyToken, authJwt.isAdmin], spaceController.deleteSpace);

  
};