const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const Sse = require("json-sse"); // step 1. import sse
const roomFactory = require("./room/router"); // step 5.
const Room = require("./room/model");

const cors = require("cors");
const corsMiddleware = cors();
app.use(corsMiddleware);

const bodyParser = require("body-parser");
const parserMiddleware = bodyParser.json();
app.use(parserMiddleware);

app.listen(port, () => console.log(`Listen on port ${port}`));

const userRouter = require("./users/router");
app.use(userRouter);

const authRouter = require("./auth/router");
app.use(authRouter);

const stream = new Sse(); // step 2. make the stream
const roomRouter = roomFactory(stream); // step 6. make the router
app.use(roomRouter); // step 7. run the router

// app.get("/stream", (request, response, next) => {
//   // step 3.
//   // step 4. in /room/router.js
//   Room.findAll().then(rooms => {
//     const string = JSON.stringify(rooms);
//     stream.updateInit(string);
//     stream.init(request, response);
//   });
// });

app.get("/stream", async (request, response, next) => {
  // step 3.
  // step 4. in /room/router.js
  const rooms = await Room.findAll(); // this displays all the rooms
  // console.log("rooms test:", rooms);
  const string = JSON.stringify(rooms);
  stream.updateInit(string); // this updates the stream when the user enters the page
  stream.init(request, response); // this connects the stream
});

const db = require("./db");
const User = require("./users/model");
