const Sequelize = require("sequelize");
const db = require("../db");

const Room = db.define("room", {
  name: Sequelize.STRING,
  turn: Sequelize.INTEGER
});

module.exports = Room;
