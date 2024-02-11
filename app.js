import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import {
  createAdmin,
  createConsumer,
  createNewTopic,
  createProducer,
} from "./utils.js";
dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT });

function getObj(byt) {
  const parsedString = byt.toString();
  const parsedObj = JSON.parse(parsedString);
  return parsedObj;
}

wss.on("connection", function connection(ws) {
  // enable sending json
  // console.log(ws);
  ws.json = (obj) => ws.send(JSON.stringify(obj));
  ws.on("message", async function message(data) {
    const obj = getObj(data);
    switch (obj.type) {
      case "createNote":
        await pubNewNote(obj);
        break;
      case "addDevice":
        await subNewDevice(ws, obj);
        break;
      case "syncDevices":
        console.log(obj);
        await createNewTopic(obj.uid);
        await checkNewDevices(ws, obj);
        await syncNotes(ws, obj);
        break;
      default:
        break;
    }
    // console.log("received:", obj));
  });
});

// publish the new note to the topic of the device
async function pubNewNote(data) {
  try {
    const producer = createProducer();
    await producer.connect();
    console.log("pub new note", data);
    const obj = { key: data.newNote.uid, value: JSON.stringify(data) };
    await producer.send({
      topic: data.uid,
      messages: [obj],
    });
    // await producer.disconnect();
  } catch (error) {
    console.log(error);
  }
}

// subscribe the new device to the current device uid topic
// this will return all the notes of the current device
async function subNewDevice(ws, data) {
  const consumer = createConsumer(data.uid);
  await consumer.connect();
  const producer = createProducer();
  await producer.connect();
  try {
    console.log("sub new device", data);
    await consumer.subscribe({
      topic: data.newDeviceId,
      fromBeginning: true,
    });
    await consumer.run({
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        console.log({
          key: message.key.toString(),
          value: message.value.toString(),
          headers: message.headers,
        });
        ws.send(message.value.toString());
        await heartbeat();
      },
    });
    // send the data to the other device for consumption
    const newData = {
      type: "syncDevices",
      uid: data.uid,
      newDeviceId: data.newDeviceId,
    };
    const obj = { key: newData.type, value: JSON.stringify(newData) };
    await producer.send({
      topic: data.newDeviceId,
      messages: [obj],
    });
    ws.json(data);
  } catch (error) {
    console.log(error);
  }
}

// check if a new device has subscribed
async function checkNewDevices(ws, data) {
  const consumer = createConsumer(data.uid);
  await consumer.connect();
  try {
    console.log("checking for new devices", data);
    // look for new subscribers in your topic and subscribe to them
    await consumer.subscribe({
      topic: data.uid,
    });
    await consumer.run({
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        console.log({
          key: message.key.toString(),
          value: message.value.toString(),
          headers: message.headers,
        });
        if (message.key.toString() === "syncDevices") {
          ws.send(message.value.toString());
        }
        await heartbeat();
      },
    });
  } catch (error) {
    console.log(error);
  }
}

// get notes from subscribed devices
async function syncNotes(ws, data) {
  if (data.devicesList.length === 0) {
    console.log("returning becoz of empty device list");
    return;
  }
  const consumer = createConsumer(data.uid);
  await consumer.connect();
  try {
    console.log("sync notes", data);

    await consumer.subscribe({
      topics: data.devicesList,
    });
    await consumer.run({
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        console.log({
          key: message.key.toString(),
          value: message.value.toString(),
          headers: message.headers,
        });
        ws.send(message.value.toString());
        await heartbeat();
      },
    });
  } catch (error) {
    console.log(error);
  }
}

process.on("SIGINT", async () => {
  console.log("disconnecting kafka");
  process.exit(0);
});
