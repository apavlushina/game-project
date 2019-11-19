const Sequelize = require("sequelize");
const db = require("../db");

const User = db.define("user", {
  name: Sequelize.STRING,
  password: Sequelize.TEXT,
  email: Sequelize.STRING
});

const Room = require("../room/model");
User.belongsTo(Room); // The roomId column will be null in the beginning

module.exports = User;
