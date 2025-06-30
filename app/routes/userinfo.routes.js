const { authJwt } = require("../middleware");
const userInfoController = require("../controllers/userinfo.controller");
const { checkRequirements} = require(("../middleware"));

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/getUserInfo", [authJwt.verifyToken], userInfoController.getUserInfo);

  app.post("/api/createUserInfo", [authJwt.verifyToken], userInfoController.createUserInfo);


  app.get("/api/getUserHistory", [authJwt.verifyToken], userInfoController.getUserHistory);
};
