const Sequelize = require("sequelize");
const db = require("../db");

const User = db.define("user", {
  name: Sequelize.STRING,
  password: Sequelize.TEXT,
  email: Sequelize.STRING
});

const Room = require("../room/model");
User.belongsTo(Room); // The roomId column will be null in the beginning
Room.hasMany(User); // !!! This must be in the same file as belongsTo
// we can now include users in rooms -> each room with have users property that is an array of users
// two-way relationship

module.exports = User;
