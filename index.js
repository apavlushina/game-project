const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const Sse = require("json-sse"); // step 1. import sse
const roomFactory = require("./room/router"); // step 5.
const Room = require("./room/model");
const User = require("./users/model");

const cors = require("cors");
const corsMiddleware = cors();
app.use(corsMiddleware);

app.use(roomRouter);

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
  const rooms = await Room.findAll({ include: [User] }); // this displays all the rooms
  // console.log("rooms test:", rooms);

  // action creation on the backend; this will be sent straight to the frontend reducer:
  const action = {
    type: "ROOMS",
    payload: rooms
  };
  // stringify(action) below

  const string = JSON.stringify(action); // this sends an action object straight to the reducer
  // this is so that the stream.onmessage always catches an action object for scalability
  stream.updateInit(string); // this updates the stream when the user enters the page
  stream.init(request, response); // this connects the stream
});
