const Sequelize = require("sequelize");
const db = require("../db");

const Room = db.define("user", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Room;
