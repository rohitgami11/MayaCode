# Kafka Setup Guide for MayaCode Chat

## Prerequisites

1. **Kafka Cluster** - You need a running Kafka cluster
2. **MongoDB** - Already configured in your project
3. **Redis/Valkey** - Already configured in your project

## Environment Variables

Add these to your `.env` file based on your Kafka setup:

### **Local Kafka (Default)**
```env
# Kafka Configuration
KAFKA_BROKERS=localhost:9092
```

### **Confluent Cloud**
```env
# Kafka Configuration
KAFKA_BROKERS=pkc-xxxxx.us-east-1.aws.confluent.cloud:9092
KAFKA_SASL_USERNAME=your_api_key
KAFKA_SASL_PASSWORD=your_api_secret
KAFKA_SASL_MECHANISM=plain
KAFKA_SSL_ENABLED=true
KAFKA_SSL_REJECT_UNAUTHORIZED=false
```

### **AWS MSK**
```env
# Kafka Configuration
KAFKA_BROKERS=b-1.xxxxx.kafka.us-east-1.amazonaws.com:9092,b-2.xxxxx.kafka.us-east-1.amazonaws.com:9092
KAFKA_SASL_USERNAME=AWS
KAFKA_SASL_PASSWORD=your_aws_credentials
KAFKA_SASL_MECHANISM=aws_msk_iam
KAFKA_SSL_ENABLED=true
```

### **Azure Event Hubs**
```env
# Kafka Configuration
KAFKA_BROKERS=your-namespace.servicebus.windows.net:9093
KAFKA_SASL_USERNAME=$ConnectionString
KAFKA_SASL_PASSWORD=Endpoint=sb://your-namespace.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=your-key
KAFKA_SASL_MECHANISM=plain
KAFKA_SSL_ENABLED=true
```

### **Custom Topics (Optional)**
```env
# Custom topic names (optional)
KAFKA_TOPIC_CHAT_MESSAGES=your-chat-messages-topic
KAFKA_TOPIC_MESSAGE_PERSISTENCE=your-message-persistence-topic
KAFKA_CONSUMER_GROUP_ID=your-consumer-group
```

## Kafka Installation Options

### Option 1: Local Kafka Setup

1. **Install Kafka locally:**
   ```bash
   # Download Kafka
   wget https://downloads.apache.org/kafka/3.6.1/kafka_2.13-3.6.1.tgz
   tar -xzf kafka_2.13-3.6.1.tgz
   cd kafka_2.13-3.6.1
   
   # Start Zookeeper
   bin/zookeeper-server-start.sh config/zookeeper.properties
   
   # Start Kafka (in new terminal)
   bin/kafka-server-start.sh config/server.properties
   ```

2. **Create topics:**
   ```bash
   bin/kafka-topics.sh --create --topic chat-messages --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
   ```

### Option 2: Docker Kafka Setup

1. **Create docker-compose.yml:**
   ```yaml
   version: '3'
   services:
     zookeeper:
       image: confluentinc/cp-zookeeper:latest
       environment:
         ZOOKEEPER_CLIENT_PORT: 2181
         ZOOKEEPER_TICK_TIME: 2000
       ports:
         - "2181:2181"
     
     kafka:
       image: confluentinc/cp-kafka:latest
       depends_on:
         - zookeeper
       ports:
         - "9092:9092"
       environment:
         KAFKA_BROKER_ID: 1
         KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
         KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
         KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
         KAFKA_AUTO_CREATE_TOPICS_ENABLE: true
   ```

2. **Start services:**
   ```bash
   docker-compose up -d
   ```

### Option 3: Cloud Kafka (Recommended for Production)

- **Confluent Cloud**
- **AWS MSK**
- **Azure Event Hubs**

## Installation

1. **Install dependencies:**
   ```bash
   cd Backend
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

## Architecture Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Mobile    │    │   Backend   │    │    Kafka    │    │   MongoDB   │
│   Client    │◄──►│   Server    │◄──►│   (Buffer)  │◄──►│  (Storage)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │   Redis     │
                   │ (Online)    │
                   └─────────────┘
```

## Message Flow

1. **User sends message** → Backend receives via Socket.IO
2. **Backend** → Sends to Kafka for persistence (async)
3. **Backend** → Sends to Redis for immediate delivery to online users
4. **Kafka Consumer** → Processes messages and stores in MongoDB
5. **Offline users** → Get messages when they come online via HTTP API

## API Endpoints

- `GET /api/messages/room/:roomId` - Get messages for a room
- `GET /api/messages/unread/:userId` - Get unread messages for a user
- `POST /api/messages/delivered` - Mark messages as delivered
- `PUT /api/messages/:messageId/status` - Update message status
- `GET /api/messages/stats/:roomId` - Get message statistics

## Testing

1. **Start Kafka and MongoDB**
2. **Start the backend server**
3. **Connect a client via Socket.IO**
4. **Send messages and verify they're stored in MongoDB**

## Monitoring

Check the console logs for:
- ✅ Kafka producer/consumer connection status
- 📤 Messages sent to Kafka
- 📥 Messages received from Kafka
- 💾 Messages saved to MongoDB
- 📝 Message status updates

## Troubleshooting

1. **Kafka connection issues:**
   - Check if Kafka is running
   - Verify KAFKA_BROKERS environment variable
   - Check network connectivity
   - Verify authentication credentials (if using cloud)

2. **MongoDB connection issues:**
   - Verify MONGODB_URI
   - Check MongoDB is running

3. **Message not persisting:**
   - Check Kafka consumer logs
   - Verify MongoDB connection
   - Check message buffer flushing

4. **SSL/TLS issues:**
   - Verify SSL certificates
   - Check KAFKA_SSL_ENABLED setting
   - Ensure proper SSL configuration for your provider

5. **Authentication issues:**
   - Verify SASL credentials
   - Check KAFKA_SASL_MECHANISM
   - Ensure proper authentication setup for your provider 