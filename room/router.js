const express = require("express");
const Room = require("./model");
const auth = require("../auth/middleware");

const { Router } = express;

function roomFactory(stream) {
  // step 4.
  const router = new Router();

  router.post("/room", auth, (request, response) => {
    Room.create(request.body).then(room => {
      const action = {
        type: "ROOM",
        payload: room
      };
      const data = JSON.stringify(action); // this sends an action object straight to the reducer
      // this is so that the stream.onmessage always catches an action object for scalability
      stream.send(data);
      response.send(room);
    });
  });

  return router;
}

module.exports = roomFactory;
