const express = require("express");
const { Router } = express;
const User = require("./model");
const bcrypt = require("bcrypt");
const router = new Router();
const { toJWT, toData } = require("../auth/jwt");
const Room = require("../room/model");
const auth = require("../auth/middleware");

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
    password: bcrypt.hashSync(req.body.password, 10),
    coins: 5
  };

  User.create(user)
    .then(user => res.send(toJWT({ userId: user.id })))
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

module.exports = router;
