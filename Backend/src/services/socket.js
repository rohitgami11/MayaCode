const { Server } = require("socket.io");
const Redis = require("ioredis");
// const prismaClient = require("./prisma");
// const { produceMessage } = require("./kafka");

// Only create Redis clients if VALKEY_HOST is configured
let pub = null;
let sub = null;

if (process.env.VALKEY_HOST) {
  pub = new Redis({
    host: process.env.VALKEY_HOST,
    port: process.env.VALKEY_PORT,
    username: process.env.VALKEY_USERNAME,
    password: process.env.VALKEY_PASSWORD,
  });

  sub = new Redis({
    host: process.env.VALKEY_HOST,
    port: process.env.VALKEY_PORT,
    username: process.env.VALKEY_USERNAME,
    password: process.env.VALKEY_PASSWORD,
  });
} else {
  console.warn('⚠️ VALKEY_HOST not configured. Redis pub/sub will not work.');
}

class SocketService {
  
  constructor() {
    console.log("Init Socket Service...");
    this._io = new Server(
      {
        cors: {
          allowedHeaders: ["*"],
          origin: "*",
        },
      }
    );
    if (sub) {
      sub.subscribe("MESSAGES");
    }
  }

  initListeners() {
    const io = this.io;
    console.log("Init Socket Listeners...");

    io.on("connect", (socket) => {
      console.log(`New Socket Connected`, socket.id);
      socket.on("event:message", async ({ message }) => {
        console.log("New Message Rec.", message);
        // publish this message to redis (only if Redis is configured)
        if (pub) {
          await pub.publish("MESSAGES", JSON.stringify({ message }));
        }
      });
    });

    if (sub) {
      sub.on("message", async (channel, message) => {
        if (channel === "MESSAGES") {
          console.log("new message from redis", message);
          io.emit("message", message);
          // await produceMessage(message);
          // console.log("Message Produced to Kafka Broker");
        }
      });
    }
  }

  get io() {
    return this._io;
  }
}

module.exports = SocketService;