import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SocketProvider, useSocket } from '../../context/SocketContext';

// Message bubble component for each message
const MessageBubble = ({ text }: { text: string }) => (
  <View style={[styles.messageContainer, styles.otherMessage]}>
    <Text style={styles.messageText}>{text}</Text>
  </View>
);

const Chat = () => {
  const { sendMessage, messages } = useSocket();
  const [messageInput, setMessageInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>
        <ScrollView
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} text={msg} />
          ))}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={messageInput}
            onChangeText={setMessageInput}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FDFDE3',
    paddingBottom: 70,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  messagesList: {
    flex: 1,
    padding: 0,
  },
  messagesContent: {
    paddingBottom: 100,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#075E54',
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Chat; 