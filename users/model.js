const Sequelize = require("sequelize");
const db = require("../db");

const User = db.define("user", {
  name: Sequelize.STRING,
  password: Sequelize.TEXT,
  email: Sequelize.STRING
});

module.exports = User;
