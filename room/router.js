const express = require("express");
const Room = require("./model");

const { Router } = express;

function roomFactory(stream) {
  // step 4.
  const router = new Router();

  router.post("/room", (request, response) => {
    Room.create(request.body).then(room => {
      const data = JSON.stringify(room);
      stream.send(data);
      response.send(room);
    });
  });

  router.get("/room", (request, response, next) => {
    Room.findAll().then(rooms => {
      const data = JSON.stringify(rooms);
      stream.send(data);
      response.send(rooms);
    });
  });

  return router;
}

module.exports = roomFactory;
