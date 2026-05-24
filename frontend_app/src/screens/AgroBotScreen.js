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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Bot, User as UserIcon, Sparkles, MessageCircle } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import ScreenHero from '../components/ScreenHero';
import { Colors } from '../theme/colors';
import { screenStyles } from '../theme/screenStyles';
import { API_BASE_URL } from '../config';
import axios from 'axios';

const LANGUAGES = ['English', 'Hindi'];

const QUICK_PROMPTS = [
  'Best fertilizer for tomatoes?',
  'How to treat leaf blight?',
  'When to irrigate wheat?',
];

const AgroBotScreen = () => {
  const [language, setLanguage] = useState('English');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hello Farmer! I am AgroBot. Ask me anything about crops, soil, pests, or weather.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const handleSend = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: text,
        history: messages.slice(1).map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        })),
      });

      if (response.data?.reply) {
        setMessages((prev) => [...prev, { role: 'bot', text: response.data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: "Sorry, I'm having trouble connecting. Please try again." },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: `Could not reach the server. Ensure the backend is running at ${API_BASE_URL}.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={screenStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        style={styles.chatContainer}
        ref={scrollViewRef}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHero
          badgeIcon={<Sparkles size={12} color="#6ee7b7" />}
          badgeText="BILINGUAL AI ASSISTANT"
          title="AgroBot AI"
          subtitle="Expert answers on soil, crops, pests, and regional farming practices."
          stats={[
            { value: '2', label: 'Languages' },
            { value: '24/7', label: 'Online' },
            { value: 'Free', label: 'Support' },
          ]}
          gradient="green"
        />

        <View style={styles.langSection}>
          <Text style={screenStyles.sectionEyebrow}>Response language</Text>
          <View style={styles.langRow}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => setLanguage(lang)}
                style={[styles.langChip, language === lang && styles.langChipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.langChipText, language === lang && styles.langChipTextActive]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.messagesSection}>
        {messages.length <= 1 && (
          <View style={styles.promptsSection}>
            <Text style={screenStyles.sectionEyebrow}>Quick questions</Text>
            {QUICK_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                style={styles.promptChip}
                onPress={() => handleSend(prompt)}
                activeOpacity={0.8}
              >
                <MessageCircle size={14} color={Colors.primaryDark} />
                <Text style={styles.promptChipText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {messages.map((m, i) => (
          <View
            key={i}
            style={[styles.messageRow, m.role === 'user' ? styles.userRow : styles.botRow]}
          >
            <View
              style={[styles.avatar, m.role === 'user' ? styles.userAvatar : styles.botAvatar]}
            >
              {m.role === 'user' ? (
                <UserIcon size={16} color={Colors.primaryDark} />
              ) : (
                <Bot size={16} color="#065f46" />
              )}
            </View>
            <View style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.botBubble]}>
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
              <Bot size={16} color="#065f46" />
            </View>
            <View style={[styles.bubble, styles.botBubble, styles.loadingBubble]}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>AgroBot is thinking…</Text>
            </View>
          </View>
        )}
        </View>
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder={loading ? 'Waiting…' : `Ask in ${language}…`}
          placeholderTextColor={Colors.textMuted}
          value={input}
          onChangeText={setInput}
          editable={!loading}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
          onPress={() => handleSend()}
          disabled={!input.trim() || loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={!input.trim() || loading ? ['#94a3b8', '#64748b'] : ['#10b981', '#059669']}
            style={styles.sendGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send color="#fff" size={20} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  langSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  langRow: {
    flexDirection: 'row',
    gap: 10,
  },
  langChip: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  langChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  langChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  langChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  messagesSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  promptsSection: {
    marginBottom: 16,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  promptChipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMain,
    fontWeight: '500',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '88%',
  },
  userRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botRow: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  userAvatar: {
    backgroundColor: Colors.primaryLight,
    marginLeft: 8,
  },
  botAvatar: {
    backgroundColor: '#d1fae5',
    marginRight: 8,
  },
  bubble: {
    padding: 14,
    borderRadius: 18,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 14,
    paddingBottom: Platform.OS === 'ios' ? 20 : 14,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textMain,
  },
  sendButton: {
    marginLeft: 10,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.85,
  },
  sendGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: Colors.textMain,
    fontSize: 15,
    lineHeight: 22,
  },
  heading3: {
    color: Colors.primaryDark,
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
});

export default AgroBotScreen;
