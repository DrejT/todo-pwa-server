import kafka from "./connect.kafka.js";
// const gid = "todo-group";
// const gid = (Math.random() * 10000).toString();
export const createConsumer = (uid) =>
  kafka.consumer({
    groupId: uid,
    sessionTimeout: 30000,
    heartbeatInterval: 10000,
    rebalanceTimeout: 500,
  });
export const createProducer = () => kafka.producer();
export const createAdmin = () => kafka.admin();

// create a new topic for the deviceId given
export async function createNewTopic(uid) {
  try {
    const admin = createAdmin();
    await admin.connect();
    const topicsList = await admin.listTopics();
    if (!topicsList.includes(uid)) {
      console.log("inside create topics");
      const topicConfig = {
        topic: uid,
      };
      await admin.createTopics({
        timeout: 30000,
        topics: [topicConfig],
      });
    }
  } catch (error) {
    console.log(error);
  }
}
