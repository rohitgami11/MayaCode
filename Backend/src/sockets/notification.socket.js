module.exports = (io, socket, pub) => {
  socket.on("notification:send", (data) => {
    console.log("Received notification:", data);
    pub.publish("NOTIFICATION_MESSAGES", JSON.stringify(data));
  });
};
