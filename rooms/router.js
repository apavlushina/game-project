const express = require("express");
const Room = require("./model");

const { Router } = express;

function roomFactory(stream) {
  const router = new Router();

  router.post("/room", (req, res) => {
    Room.create(req.body).then(room => {
      const data = JSON.stringify(room);
      stream.send(data);
      res.send(room);
    });
  });

  return router;
}

module.exports = roomFactory;
