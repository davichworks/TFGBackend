const { authJwt, verifySignUp  } = require("../middleware");
const userController = require("../controllers/user.controller");
const { checkRequirements } = require("../middleware");



module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/all",userController.getPublicContent);

    app.get("/api/alltrainers",userController.getTrainers);


  app.get("/api/admin", [authJwt.verifyToken, authJwt.isAdmin], userController.getAllUsers);

  app.post("/api/blockEmail", [authJwt.verifyToken, authJwt.isAdmin], userController.blockEmail);

  app.delete("/api/deleteUsuario", [authJwt.verifyToken, authJwt.isAdmin], userController.deleteUser);

  app.post("/api/createTrainer", [authJwt.verifyToken, authJwt.isAdmin], userController.createTrainer);

  app.put("/api/updateUser/:id",[authJwt.verifyToken, verifySignUp.checkDuplicateUsernameOrEmail2 , verifySignUp.verify ], userController.updateUser);

  app.post("/api/changePassword",[authJwt.verifyToken , checkRequirements.checkPasswordRequirements],userController.changePassword);

};
