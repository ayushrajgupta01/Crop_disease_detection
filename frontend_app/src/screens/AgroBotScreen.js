import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { Send, Bot, User, Leaf, Loader2 } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import { Colors } from '../theme/colors';
import { API_BASE_URL } from '../config';
import axios from 'axios';

const AgroBotScreen = () => {
  const [language, setLanguage] = useState('English');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello Farmer! I am AgroBot. How can I help you today with your crops?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const languages = ['English', 'Hindi', 'Marathi', 'Telugu', 'Tamil', 'Punjabi'];

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: input,
        history: messages.slice(1).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      });

      if (response.data && response.data.reply) {
        setMessages(prev => [...prev, { role: 'bot', text: response.data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to server. Is the backend running at " + API_BASE_URL + "?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Leaf color={Colors.primary} size={24} />
          <Text style={styles.title}>AgroBot AI</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.langScroll}>
          {languages.map(lang => (
            <TouchableOpacity 
              key={lang} 
              onPress={() => setLanguage(lang)}
              style={[
                styles.langButton, 
                language === lang && styles.langButtonActive
              ]}
            >
              <Text style={[
                styles.langText, 
                language === lang && styles.langTextActive
              ]}>{lang}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.chatContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map((m, i) => (
          <View key={i} style={[
            styles.messageRow, 
            m.role === 'user' ? styles.userRow : styles.botRow
          ]}>
            <View style={[
              styles.avatar, 
              m.role === 'user' ? styles.userAvatar : styles.botAvatar
            ]}>
              {m.role === 'user' ? <User size={18} color={Colors.primary} /> : <Bot size={18} color="#00695c" />}
            </View>
            <View style={[
              styles.bubble, 
              m.role === 'user' ? styles.userBubble : styles.botBubble
            ]}>
              {m.role === 'user' ? (
                <Text style={styles.userText}>{m.text}</Text>
              ) : (
                <Markdown style={markdownStyles}>{m.text}</Markdown>
              )}
            </View>
          </View>
        ))}
        {loading && (
          <View style={styles.botRow}>
            <View style={[styles.avatar, styles.botAvatar]}>
              <Bot size={18} color="#00695c" />
            </View>
            <View style={[styles.bubble, styles.botBubble, styles.loadingBubble]}>
              <ActivityIndicator size="small" color={Colors.textMuted} style={{ marginRight: 8 }} />
              <Text style={styles.loadingText}>AgroBot is researching...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input}
          placeholder={loading ? "Waiting..." : `Ask in ${language}...`}
          value={input}
          onChangeText={setInput}
          disabled={loading}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          {loading ? <ActivityIndicator size="small" color="white" /> : <Send color="white" size={20} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: Colors.textMain,
  },
  langScroll: {
    flexDirection: 'row',
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  langButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  langText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  langTextActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
    padding: 15,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botRow: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  userAvatar: {
    backgroundColor: Colors.primaryLight,
    marginLeft: 8,
  },
  botAvatar: {
    backgroundColor: '#e0f2f1',
    marginRight: 8,
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  userText: {
    color: Colors.white,
    fontSize: 15,
    lineHeight: 20,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textMuted,
    fontStyle: 'italic',
    fontSize: 14,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.6,
  }
});

const markdownStyles = StyleSheet.create({
  body: {
    color: Colors.textMain,
    fontSize: 15,
    lineHeight: 22,
  },
  heading3: {
    color: '#2e7d32',
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  heading4: {
    color: '#388e3c',
    marginTop: 8,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  strong: {
    color: '#1b5e20',
    fontWeight: 'bold',
  },
  bullet_list: {
    marginTop: 5,
  },
  list_item: {
    marginBottom: 5,
  }
});

export default AgroBotScreen;
