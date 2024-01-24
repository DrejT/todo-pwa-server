import { WebSocketServer } from "ws";
import dotenv from "dotenv";
dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT });

wss.on("connection", function connection(ws) {
  // enable sending json
  ws.json = (obj) => ws.send(JSON.stringify(obj));
  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.send("something");
});
