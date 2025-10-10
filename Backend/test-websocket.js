const io = require('socket.io-client');

// Connect to the WebSocket server
const socket = io('http://localhost:8000', {
  transports: ['websocket']
});

console.log('🔌 Connecting to WebSocket server...');

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server!');
  console.log('Socket ID:', socket.id);
  
  // Test sending a chat message
  const testMessage = {
    message: "Hello from test script!",
    roomId: "test-room-1",
    senderId: "test-user-1",
    messageType: "text",
    recipients: ["user-2", "user-3"]
  };
  
  console.log('📤 Sending test message:', testMessage);
  socket.emit('chat:send', testMessage);
});

socket.on('message:delivered', (data) => {
  console.log('✅ Message delivered:', data);
});

socket.on('message:error', (data) => {
  console.log('❌ Message error:', data);
});

socket.on('chat:receive', (data) => {
  console.log('📨 Received message:', data);
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from WebSocket server');
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error);
});

// Disconnect after 5 seconds
setTimeout(() => {
  console.log('🔌 Disconnecting...');
  socket.disconnect();
  process.exit(0);
}, 5000); 