const express = require("express");
const Room = require("./model");
const User = require("../users/model");
const auth = require("../auth/middleware");
const { toData } = require("../auth/jwt");

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

  router.put("/users/join", auth, async (req, res, next) => {
    console.log("what is this?", req.body.jwt, req.body);
    const userId = toData(req.body.jwt).userId;
    const room = await Room.findOne({ where: { name: req.body.roomName } });
    const roomId = room.dataValues.id;
    console.log("IT WORKS", userId, roomId);

    const user = await User.findByPk(userId);
    // console.log("user test", user);
    if (!user) {
      return next("No user found");
    }

    const updated = await user.update({ roomId });

    const rooms = await Room.findAll({ include: [User] });
    const action = {
      type: "ROOMS",
      payload: rooms
    };
    const string = JSON.stringify(action);

    stream.send(string);

    response.send(updated => console.log(updated));
  });

  return router;
}

module.exports = roomFactory;
