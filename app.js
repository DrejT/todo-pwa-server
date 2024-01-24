import { WebSocketServer } from "ws";
import dotenv from "dotenv";
dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT });

wss.on("connection", function connection(ws) {
  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.send("something");
});

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// dotenv.config();
//
// const app = express();
//
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
//
// app.listen(process.env.PORT, () =>
// console.log(`listening to ${process.env.PORT}`)
// );
