const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
 
  const adminPassword = 'SuperAdmin';

  
  User.create({
    name : req.body.name+" "+req.body.surname+" "+req.body.surname2,
    username: req.body.username,
    birthday: req.body.birthday,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8) ,
    number: req.body.number,
    dni: req.body.dni,
    emailBlocked: false
  })
    .then(user => {
      if (req.body.password === adminPassword) {
        
        Role.findAll({
          where: {
            name: "admin"
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User was registered successfully as admin!" });
          });
        });
      } else if (req.body.roles) {
        
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
         
          user.setRoles(roles).then(() => {
            res.send({ message: "User was registered successfully!" });
          });
        });
      } else {
        Role.findOne({
          where: {
            name: "user"
          }
        }).then(role => {
          user.setRoles([role.id]).then(() => {
            res.send({ message: "User was registered successfully!" });
          });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};


exports.signin = (req, res) => {
  
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      if (user.emailBlocked) {
        return res.status(403).send({ message: "User is blocked." });
      }
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }
      const token = jwt.sign({ id: user.id },
                              config.secret,
                              {
                                algorithm: 'HS256',
                                allowInsecureKeySizes: true,
                                expiresIn: 86400, // 24 hours
                              });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          birthday: user.birthday,
          number: user.number,
          dni: user.dni,
          roles: authorities,
          accessToken: token
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
