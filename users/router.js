const express = require("express");
const { Router } = express;
const { toJWT } = require("../auth/jwt");
const User = require("./model");
const bcrypt = require("bcrypt");
const router = new Router();
router.get("/users", (_request, response, next) => {
  User.findAll()
    .then(names => response.json(names))
    .catch(err => next(err));
});

router.post("/users", (req, res, next) => {
  console.log(" test req.body", req.body);
  const user = {
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };

  User.create(user)
    .then(user => toJWT({ userID: user.id }))
    .then(res => res.send)
    .catch(err => next(err));
});

router.get("/users/:userId", (req, res, next) => {
  User.findByPk(req.params.userId)
    .then(name => {
      if (!name) {
        res.status(404).end();
      } else {
        res.json(name);
      }
    })
    .catch(next);
});

router.put("/users/:userId", (req, res, next) => {
  User.findByPk(req.params.userId)
    .then(name => {
      if (name) {
        name.update(req.body).then(name => res.json(name));
      } else {
        res.status(404).end();
      }
    })
    .catch(next);
});

module.exports = router;
