const express = require("express");
const Room = require("./model");
const auth = require("../auth/middleware");
const { toData } = require("../auth/jwt");
const User = require("../users/model");
const Sequelize = require("sequelize");
const { serialize } = require("../do");

console.log("serialize test:", serialize);

const { Router } = express;

function roomFactory(stream) {
  // step 4.
  const router = new Router();

  router.post("/room", auth, async (request, response) => {
    const room = await Room.create(request.body);

    const created = await Room.findByPk(room.id, { include: [User] });

    const string = serialize("ROOM", created); // this sends an action object straight to the reducer
    // this is so that the stream.onmessage always catches an action object for scalability
    stream.send(string);
    response.send(room);
    console.log("post room test");
  });

  router.put("/join", auth, async (req, res, next) => {
    // console.log("what is this?", req.body.jwt, req.body);
    const userId = toData(req.body.jwt).userId;
    const room = await Room.findOne({
      where: { name: req.body.roomName },
      include: [User]
    });
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

    const string = serialize("ROOMS", rooms);
    stream.send(string);
    res.send(updated);
  });

  router.put("/status", async (req, res, next) => {
    const userId = toData(req.body.jwt).userId;
    const user = await User.findByPk(userId);

    // update database
    if (req.body.decision === "cooperate") {
      user
        .update({
          coins: Sequelize.literal("coins-1"),
          decision: req.body.decision
        })
        .catch(console.error);
    } else {
      user.update({ decision: req.body.decision }).catch(console.error);
    }

    const string = serialize("DECISION", user);
    stream.send(string);
  });
  // DONE start: each player start with 5 coins (coin column)

  // DONE status: check player waiting or thinking (decision column)

  // DONE updatePlayer: when a player decides (presses a button), the player's coins and decision columns change

  // comparePlayers: when we have two decisions, compare the players and show the correct results
  // update both players' coins and decision columns; incrase room turn counter

  // finalRound: when it is the final round, shows the result and ends the game; kicks them out of the room

  // when refresh, no roomId for players

  // frontend: display the rules on the page at all times (button etc)
  //bootstrap slider??

  // create description of results (each round and final results)

  return router;
}

module.exports = roomFactory;
