const express = require("express");
const Room = require("./model");
const auth = require("../auth/middleware");
const { toData } = require("../auth/jwt");
const User = require("../users/model");

const { Router } = express;

function roomFactory(stream) {
  // step 4.
  const router = new Router();

  router.post("/room", auth, async (request, response) => {
    const room = await Room.create(request.body);
    const action = {
      type: "ROOM",
      payload: room
    };
    const string = JSON.stringify(action); // this sends an action object straight to the reducer
    // this is so that the stream.onmessage always catches an action object for scalability
    stream.send(string);
    response.send(room);
    console.log("post room test");
  });

  router.put("/join", auth, async (req, res, next) => {
    // console.log("what is this?", req.body.jwt, req.body);
    const userId = toData(req.body.jwt).userId;
    const room = await Room.findOne({ where: { name: req.body.roomName } });
    const roomId = room.dataValues.id;
    // console.log("IT WORKS???", userId, roomId);
    const user = await User.findByPk(userId);
    // console.log("user test", user);
    if (!user) {
      return next("No user found");
    }
    const updated = await user.update({ roomId });
    const rooms = await Room.findAll({ include: [User] });
    // console.log("DO WE HAVE ROOMS?", rooms);
    const action = {
      type: "ROOMS",
      payload: rooms
    };
    const string = JSON.stringify(action);
    stream.send(string);
    res.send(updated);
  });

  return router;
}

module.exports = roomFactory;
