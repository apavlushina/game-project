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

router.put("/users/join", auth, async (req, res, next) => {
  // console.log("what is this?", req.body.jwt, req.body);
  const userId = toData(req.body.jwt).userId;
  const room = await Room.findOne({ where: { name: req.body.roomName } });
  const roomId = room.dataValues.id;
  // console.log("IT WORKS", userId, roomId);

  const user = await User.findByPk(userId);
  // console.log("user test", user);

  const rooms = await room.findAll({ include: [User] });
  const action = {
    type: "ROOMS",
    payload: rooms
  };
  const string = JSON.stringify(action);
  // stream.send(string)
  // this needs to be in the room router with the stream!

  return user.update({ roomId });
});

module.exports = roomFactory;
