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

  router.post("/room", auth, async (request, response, next) => {
    const body = {
      name: request.body.name,
      turn: 1
    };

    const room = await Room.create(body).catch(err => next(err));
    const string = serialize("ROOM", room); // this sends an action object straight to the reducer
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

  router.put("/status", auth, async (req, res, next) => {
    const { user } = req;

    try {
      // update database
      await user.update({
        coins: Sequelize.literal("coins-1"),
        decision: req.body.decision
      });

      const room = await Room.findByPk(user.roomId, { include: [User] });
      const { users } = room;
      const ready = users.every(user => user.decision);

      if (ready) {
        if (users.every(user => user.decision === "cooperate")) {
          await User.update(
            {
              coins: Sequelize.literal("coins+3"),
              decision: null
            },
            { where: { roomId: room.id } }
          );
        } else if (users.every(user => user.decision === "cheat")) {
          await User.update(
            {
              coins: Sequelize.literal("coins+1"),
              decision: null
            },
            { where: { roomId: room.id } }
          );
        } else {
          const promises = users.map(user => {
            if (user.decision === "cheat") {
              return user.update({
                coins: Sequelize.literal("coins+4"),
                decision: null
              });
            } else {
              return user.update({
                decision: null
              });
            }
          });

          await Promise.all(promises);
        }

        await room.update({ turn: Sequelize.literal("turn+1") });

        if (room.turn > 5) {
          await User.update(
            {
              coins: 5,
              decision: null
            },
            { where: { roomId: room.id } }
          );
          await room.update({
            turn: 0
          });
        }
      }

      const rooms = await Room.findAll({ include: [User] });

      const string = serialize("ROOMS", rooms);
      stream.send(string);
    } catch (error) {
      next(error);
    }
  });
  // DONE start: each player start with 5 coins (coin column)

  // DONE status: check player waiting or thinking (decision column)

  // DONE updatePlayer: when a player decides (presses a button), the player's coins and decision columns change

  // DONE comparePlayers: when we have two decisions, compare the players and show the correct results
  // DONE update both players' coins and decision columns; incrase room turn counter

  // finalRound: when it is the final round, shows the result and ends the game;
  // DONE kicks them out of the room

  // when refresh, no roomId for players

  // frontend: display the rules on the page at all times (button etc)
  //bootstrap slider??

  // create description of results (each round and final results)

  return router;
}

module.exports = roomFactory;
