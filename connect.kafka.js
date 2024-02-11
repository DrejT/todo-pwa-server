import { Kafka, logLevel } from "kafkajs";

const kafka = new Kafka({
  clientId: "todo-pwa",
  brokers: ["localhost:9093"],
  logLevel: logLevel.ERROR,
});

export default kafka;
