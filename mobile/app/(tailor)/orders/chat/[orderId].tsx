import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../../src/theme/colors.js';
import { typography } from '../../../../src/theme/typography.js';
import { useAuthStore } from '../../../../src/store/authStore.js';
import api from '../../../../src/services/api.js';

export default function OrderChatScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const user = useAuthStore((state) => state.user);

  const [messages, setMessages] = useState<any[]>([]);
  const [quickReplies, setQuickReplies] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/${orderId}/messages`);
      if (res.data?.success) {
        setMessages(res.data.data || []);
        if (res.data.meta?.quickReplies) {
          setQuickReplies(res.data.meta.quickReplies);
        }
      }
    } catch {
      // Mock fallback
      setMessages([
        {
          id: '1',
          senderId: 'tailor1',
          type: 'TEXT',
          body: 'আসসালামু আলাইকুম! আপনার পাঞ্জাবির কাপড় আমরা গ্রহণ করেছি।',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          senderId: user?.id || 'cust1',
          type: 'VOICE',
          durationSec: 12,
          body: null,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ]);
      setQuickReplies([
        { id: 'qr_1', text: 'আপনার কাপড় পেয়েছি।' },
        { id: 'qr_2', text: 'কাল ট্রায়ালে আসুন।' },
        { id: 'qr_3', text: 'পোশাক রেডি হয়েছে।' },
      ]);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [orderId]);

  // Recording timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recording) {
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(interval);
  }, [recording]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    setInputText('');
    try {
      const res = await api.post(`/chat/${orderId}/messages`, {
        body: text,
        type: 'TEXT',
      });

      if (res.data?.success) {
        setMessages((prev) => [...prev, res.data.data]);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    } catch {
      // Optimistic local fallback
      const newMsg = {
        id: `mock_${Date.now()}`,
        senderId: user?.id,
        type: 'TEXT',
        body: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const handleSendVoiceNote = async () => {
    setRecording(false);
    const duration = recordSeconds || 5;

    try {
      const res = await api.post(`/chat/${orderId}/messages`, {
        type: 'VOICE',
        durationSec: duration,
        mediaUrl: 'https://example.com/audio_sample.mp3',
      });
      if (res.data?.success) {
        setMessages((prev) => [...prev, res.data.data]);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    } catch {
      const newMsg = {
        id: `mock_voice_${Date.now()}`,
        senderId: user?.id,
        type: 'VOICE',
        durationSec: duration,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>অর্ডার চ্যাট ও ভয়েস নোট</Text>
            <Text style={styles.headerSubtitle}>অর্ডার নং: {orderId?.slice(0, 8)}</Text>
          </View>
        </View>

        {/* Message Feed */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => {
            const isMe = item.senderId === user?.id;

            return (
              <View
                style={[
                  styles.messageBubble,
                  isMe ? styles.myBubble : styles.theirBubble,
                ]}
              >
                {item.type === 'VOICE' ? (
                  <View style={styles.voiceNoteRow}>
                    <TouchableOpacity style={styles.playBtn}>
                      <Text style={styles.playIcon}>▶️</Text>
                    </TouchableOpacity>
                    <View style={styles.waveformContainer}>
                      <View style={[styles.waveformBar, { height: 16 }]} />
                      <View style={[styles.waveformBar, { height: 24 }]} />
                      <View style={[styles.waveformBar, { height: 12 }]} />
                      <View style={[styles.waveformBar, { height: 28 }]} />
                      <View style={[styles.waveformBar, { height: 18 }]} />
                      <View style={[styles.waveformBar, { height: 22 }]} />
                    </View>
                    <Text
                      style={[
                        styles.voiceDuration,
                        isMe ? { color: '#E8F5E9' } : { color: colors.textSecondary },
                      ]}
                    >
                      ০:{item.durationSec ? item.durationSec.toString().padStart(2, '0') : '05'}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.messageText,
                      isMe ? styles.myMessageText : styles.theirMessageText,
                    ]}
                  >
                    {item.body}
                  </Text>
                )}
                <Text
                  style={[
                    styles.timeText,
                    isMe ? styles.myTimeText : styles.theirTimeText,
                  ]}
                >
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            );
          }}
        />

        {/* Pre-set Quick Replies */}
        <View style={styles.quickReplyBar}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={quickReplies}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.quickReplyList}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSend(item.text)}
                style={styles.quickReplyPill}
              >
                <Text style={styles.quickReplyText}>💬 {item.text}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input & Voice Recorder Bar */}
        <View style={styles.inputBar}>
          {recording ? (
            <View style={styles.recordingContainer}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                রেকর্ডিং হচ্ছে... {recordSeconds}s
              </Text>
              <TouchableOpacity
                onPress={handleSendVoiceNote}
                style={styles.voiceSendBtn}
              >
                <Text style={styles.voiceSendText}>পাঠান ⬆️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRecording(false)}
                style={styles.voiceCancelBtn}
              >
                <Text style={styles.voiceCancelText}>বাতিল ✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                placeholder="মেসেজ লিখুন..."
                placeholderTextColor={colors.textMuted}
                value={inputText}
                onChangeText={setInputText}
                style={styles.textInput}
              />

              {inputText.trim() ? (
                <TouchableOpacity
                  onPress={() => handleSend()}
                  style={styles.sendBtn}
                >
                  <Text style={styles.sendIcon}>➤</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setRecording(true)}
                  style={styles.micBtn}
                >
                  <Text style={styles.micIcon}>🎙️</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    paddingRight: 12,
  },
  backIcon: {
    fontSize: 28,
    color: colors.primary,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  messageList: {
    padding: 16,
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...typography.body,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: colors.text,
  },
  timeText: {
    ...typography.caption,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirTimeText: {
    color: colors.textMuted,
  },
  voiceNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playBtn: {
    padding: 2,
  },
  playIcon: {
    fontSize: 20,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  voiceDuration: {
    ...typography.caption,
    fontWeight: '700',
  },
  quickReplyBar: {
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickReplyList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  quickReplyPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickReplyText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    ...typography.body,
    color: colors.text,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendIcon: {
    color: '#fff',
    fontSize: 18,
  },
  micBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  micIcon: {
    fontSize: 20,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFE3E3',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    marginRight: 6,
  },
  recordingText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.danger,
    flex: 1,
  },
  voiceSendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
  },
  voiceSendText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#fff',
  },
  voiceCancelBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  voiceCancelText: {
    ...typography.caption,
    color: colors.danger,
  },
});
