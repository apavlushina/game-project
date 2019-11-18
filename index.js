const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const Sse = require("json-sse"); // step 1. import sse
const roomFactory = require("./room/router"); // step 5.

const cors = require("cors");
const corsMiddleware = cors();
app.use(corsMiddleware);

const Sse = require("json-sse");
const roomFactory = require("./rooms/router");
const stream = new Sse();
const roomRouter = roomFactory(stream);

app.get("/stream", (req, res) => {
  stream.init(req, res);
});

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

app.get("/stream", (request, response, next) => {
  // step 3.
  // step 4. in /room/router.js
  // const string = JSON.stringify()
  // stream.updateInit(string)
  stream.init(request, response); // connects you to the stream
});

const db = require("./db");
const User = require("./users/model");

// const gameFactory = require("./game/router");
// const questionFactory = require("./question/router");

// const gameRouter = gameFatory(stream);
// const questionRouter = questionFatory(stream);

// app.use(gameRouter);
// app.use(questionRouter);
