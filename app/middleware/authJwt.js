const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
   
    

    if(!token){
        return res.status(403).send(
            {
                message: "No token"
            });
    }

    jwt.verify(token, config.secret, (err,decoded) => {
        if(err){
            return res.status(401).send({
                message: "Unauthorized"
            });
        }
        req.userId = decoded.id;
        
        next();
    });
};

isAdmin = (req, res, next) => {
    User.findByPk(req.userId).then(user => {
        if (!user) {
            
            res.status(404).send({
                
                message: "User no encontrado"
            });
            return;
        }

        user.getRoles().then(roles => {

            for (let i = 0; i < roles.length; i++) {

                if (roles[i].name === "admin") {
                    next();
                    return;
                }
            }
            
            res.status(403).send({
                message: "Requiere rol admin"
            });
        }).catch(err => {
            console.error("Error obteniendo roles:", err);
            res.status(500).send({
                message: "Error obteniendo roles"
            });
        });
    }).catch(err => {
        console.error("Error , Usuario no encontrado:", err);
        res.status(500).send({
            message: "Error, Usuario no encontrado"
        });
    });
};
isTrainer = (req, res, next) => {
    User.findByPk(req.userId).then(user => {
        if (!user) {
            
            res.status(404).send({
                
                message: "User no encontrado"
            });
            return;
        }

        user.getRoles().then(roles => {

            for (let i = 0; i < roles.length; i++) {

                if (roles[i].name === "admin" || roles[i].name === "trainer") {
                    next();
                    return;
                }
            }
            
            res.status(403).send({
                message: "Requiere rol admin"
            });
        }).catch(err => {
            console.error("Error obteniendo roles:", err);
            res.status(500).send({
                message: "Error obteniendo roles"
            });
        });
    }).catch(err => {
        console.error("Error , Usuario no encontrado:", err);
        res.status(500).send({
            message: "Error, Usuario no encontrado"
        });
    });
};


const authJwt = {
    verifyToken: verifyToken,
    isAdmin: isAdmin,
    isTrainer: isTrainer
  };
  module.exports = authJwt;