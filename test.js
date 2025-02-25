import mqtt from "mqtt";
const client = mqtt.connect("mqtt://138.199.200.175:1883");

client.on("connect", () => {
    client.publish("presence", "Hello mqtt");
});

client.on("message", (topic, message) => {
  // message is Buffer
  console.log(message.toString());
  client.end();
});