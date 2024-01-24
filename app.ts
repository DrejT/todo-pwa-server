import { WebSocketServer } from "ws";
import dotenv from "dotenv";
dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT });

wss.on("connection", function connection(ws: WebSocketServer) {
  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.send("something");
});
