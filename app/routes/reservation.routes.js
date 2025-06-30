const { authJwt } = require("../middleware");
const reservationController = require("../controllers/reservation.controller");
const { checkRequirements } = require("../middleware");
const Availability = require("../middleware");


module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    app.get("/api/getReservations",[authJwt.verifyToken, authJwt.isAdmin], reservationController.getReservations);

    app.get("/api/getReservation", [authJwt.verifyToken],reservationController.getReservation);

    app.post("/api/createReservation",[authJwt.verifyToken ,Availability.availability], reservationController.createReservation);
//checkRequirements.checkReservationRequirements
    app.put("/api/updateReservation/:id",[authJwt.verifyToken], reservationController.updateReservation);

    app.delete("/api/deleteReservation/:id",[authJwt.verifyToken], reservationController.deleteReservation);

};//Availability.availability