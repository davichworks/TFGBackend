const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
   
    console.log("Token received:", token);
    

    if(!token){
        return res.status(403).send(
            {
                message: "No token provid"
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
                
                message: "User not found"
            });
            return;
        }
        console.log("User found:", user);

        user.getRoles().then(roles => {
            console.log("Roles found:", roles);

            for (let i = 0; i < roles.length; i++) {
                console.log("Checking role:", roles[i].name);

                if (roles[i].name === "admin") {
                    console.log("Admin role found");
                    next();
                    return;
                }
            }
            
            console.log("Admin role not found");
            res.status(403).send({
                message: "Require admin role"
            });
        }).catch(err => {
            console.error("Error getting roles:", err);
            res.status(500).send({
                message: "Error getting roles"
            });
        });
    }).catch(err => {
        console.error("Error finding user:", err);
        res.status(500).send({
            message: "Error finding user"
        });
    });
};

isTrainer = (req, res, next) => {
    User.findByPk(req.userId).then(user => {
        if (!user) {
            res.status(404).send({
                message: "User not found"
            });
            return;
        }
        console.log("User found:", user);

        user.getRoles().then(roles => {
            console.log("Roles found:", roles);

            for (let i = 0; i < roles.length; i++) {
                console.log("Checking role:", roles[i].name);

                if (roles[i].name === "trainer") {
                    console.log("Trainer role found");
                    next();
                    return;
                }
            }
            
            console.log("Trainer role not found");
            res.status(403).send({
                message: "Require trainer role"
            });
        }).catch(err => {
            console.error("Error getting roles:", err);
            res.status(500).send({
                message: "Error getting roles"
            });
        });
    }).catch(err => {
        console.error("Error finding user:", err);
        res.status(500).send({
            message: "Error finding user"
        });
    });
};



const authJwt = {
    verifyToken: verifyToken,
    isAdmin: isAdmin,
    isTrainer: isTrainer
  };
  module.exports = authJwt;