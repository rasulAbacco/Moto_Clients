import {
  View,
  Text,
  Modal,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

// ── CONFIGURATION ────────────────────────────────────────────────────────
// ADD YOUR API KEY HERE
const GEMINI_API_KEY = "AIzaSyAynVZDkw24JFlQgmwUtKDlsfHSBaWVo90";

const SYSTEM_PROMPT = `
You are the expert AI Support Assistant for Motor Konnect (the app) and Motor Store. 
Knowledge Rules:
- We provide Car and Bike services (Scheduled Packages, Engine, AC, Detailing, etc.).
- SOS: Emergency requests (Puncture, Towing, Jumpstart) are high priority.
- Location: We suggest garages based on user's live location.
- Pricing: Owners set prices; they vary garage to garage.
- Navigation: Suggest 'Go to Profile' for adding vehicles, 'Select Garage' for services.
Interaction: Handle typos (servis -> service). Be concise. Use **bold** for emphasis.
`;

const BRAND = {
  bg: "#0A0A0F",
  surface: "#13131A",
  card: "#1C1C27",
  border: "#2A2A3D",
  accent: "#E85D04",
  accentSoft: "#FF7A2F",
  accentGlow: "rgba(232, 93, 4, 0.15)",
  text: "#F0F0F5",
  textMuted: "#8888A8",
  botBubble: "#1C1C27",
  userBubble: "#E85D04",
  green: "#22C55E",
};

const QUICK_QUESTIONS = [
  {
    id: "q1",
    icon: "car-outline",
    label: "Book Service",
    text: "How do I book a service on Motor Konnect?",
  },
  {
    id: "q2",
    icon: "alert-circle-outline",
    label: "SOS Help",
    text: "I need emergency SOS assistance right now.",
  },
  {
    id: "q3",
    icon: "cart-outline",
    label: "Motor Store",
    text: "What can I buy in the Motor Store?",
  },
  {
    id: "q4",
    icon: "pricetags-outline",
    label: "Prices",
    text: "Why do prices vary between garages?",
  },
];

// ── Components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -6,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(600),
        ]),
      );
    animate(dot1, 0).start();
    animate(dot2, 150).start();
    animate(dot3, 300).start();
  }, []);

  return (
    <View style={typStyles.container}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[typStyles.dot, { transform: [{ translateY: dot }] }]}
        />
      ))}
    </View>
  );
}

const typStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    gap: 4,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: BRAND.accent },
});

function MessageBubble({ item, isNew }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (isNew) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, []);

  const renderText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return (
      <Text style={[styles.msgText, { color: item.bot ? BRAND.text : "#fff" }]}>
        {parts.map((p, i) =>
          i % 2 === 1 ? (
            <Text
              key={i}
              style={{
                fontWeight: "700",
                color: item.bot ? BRAND.accentSoft : "#FFD580",
              }}
            >
              {p}
            </Text>
          ) : (
            p
          ),
        )}
      </Text>
    );
  };

  return (
    <Animated.View
      style={[
        styles.bubbleWrapper,
        item.bot ? styles.botWrapper : styles.userWrapper,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {item.bot && (
        <View style={styles.avatar}>
          <Ionicons name="car-sport" size={14} color={BRAND.accent} />
        </View>
      )}
      <View
        style={[styles.bubble, item.bot ? styles.botBubble : styles.userBubble]}
      >
        {renderText(item.text)}
        <Text style={styles.timestamp}>{item.time}</Text>
      </View>
    </Animated.View>
  );
}

// ── Main Chat Modal ──────────────────────────────────────────────────────

export default function ChatModal({ visible, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "👋 Welcome to **Motor Konnect**! How can I help with your car or bike today?",
      bot: true,
      time: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [newMsgIds, setNewMsgIds] = useState(new Set(["1"]));
  const flatListRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(600)).current;

  // Manual History Management for the REST API
  const conversationHistory = useRef([
    { role: "user", parts: [{ text: "Context: " + SYSTEM_PROMPT }] },
    {
      role: "model",
      parts: [{ text: "Understood. I am the Motor Konnect assistant." }],
    },
  ]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  function now() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const callGeminiAPI = async (userText) => {
    try {
      // Direct Fetch call to bypass library version issues
const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;  
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            ...conversationHistory.current,
            { role: "user", parts: [{ text: userText }] },
          ],
        }),
      });

      const json = await response.json();

      if (json.error) {
        console.error("API Error:", json.error);
        return "I'm having a technical issue. Please try again or call **1-800-GARAGE**.";
      }

      const botResponseText =
        json?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from AI";

      // Update local history for context in next message
      conversationHistory.current.push({
        role: "user",
        parts: [{ text: userText }],
      });
      conversationHistory.current.push({
        role: "model",
        parts: [{ text: botResponseText }],
      });

      return botResponseText;
    } catch (error) {
      console.error("Fetch Error:", error);
      return "Connection error. Please check your internet.";
    }
  };

  const handleProcessMessage = async (text) => {
    if (!text.trim() || typing) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      text: text.trim(),
      bot: false,
      time: now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setNewMsgIds(new Set([userMsg.id]));
    setInput("");
    setTyping(true);
    setShowQuick(false);

    const botText = await callGeminiAPI(text.trim());

    const botMsg = {
      id: `b-${Date.now()}`,
      text: botText,
      bot: true,
      time: now(),
    };
    setTyping(false);
    setMessages((prev) => [...prev, botMsg]);
    setNewMsgIds((prev) => new Set([...prev, botMsg.id]));

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoWrap}>
                <Ionicons name="car-sport" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Motor Konnect AI</Text>
                <View style={styles.onlineRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Intelligent Assistant</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={BRAND.textMuted} />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.msgList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            renderItem={({ item }) => (
              <MessageBubble item={item} isNew={newMsgIds.has(item.id)} />
            )}
            ListFooterComponent={
              typing ? (
                <View style={[styles.bubbleWrapper, styles.botWrapper]}>
                  <View style={styles.avatar}>
                    <Ionicons name="car-sport" size={14} color={BRAND.accent} />
                  </View>
                  <View
                    style={[
                      styles.bubble,
                      styles.botBubble,
                      { paddingVertical: 14 },
                    ]}
                  >
                    <TypingIndicator />
                  </View>
                </View>
              ) : null
            }
          />

          {showQuick && (
            <View style={styles.quickSection}>
              <Text style={styles.quickLabel}>Common Questions</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickScroll}
              >
                {QUICK_QUESTIONS.map((q) => (
                  <TouchableOpacity
                    key={q.id}
                    style={styles.quickChip}
                    onPress={() => handleProcessMessage(q.text)}
                  >
                    <Ionicons name={q.icon} size={14} color={BRAND.accent} />
                    <Text style={styles.quickChipText}>{q.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.inputRow}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask about car/bike service..."
                placeholderTextColor={BRAND.textMuted}
                style={styles.input}
                multiline
              />
              <TouchableOpacity
                onPress={() => handleProcessMessage(input)}
                style={[styles.sendBtn, { opacity: input.trim() ? 1 : 0.4 }]}
                disabled={!input.trim() || typing}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.footer}>
              <Ionicons
                name="flash-outline"
                size={11}
                color={BRAND.textMuted}
              />
              <Text style={styles.footerText}>Secure AI Assistance</Text>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  container: {
    height: "88%",
    backgroundColor: BRAND.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    borderTopWidth: 1,
    borderColor: BRAND.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    paddingTop: 22,
    borderBottomWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.surface,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: BRAND.accent,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: BRAND.text,
    letterSpacing: 0.3,
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BRAND.green,
  },
  onlineText: { fontSize: 11, color: BRAND.green, fontWeight: "600" },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND.card,
    alignItems: "center",
    justifyContent: "center",
  },
  msgList: { padding: 16, gap: 4, paddingBottom: 8 },
  bubbleWrapper: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-end",
    gap: 8,
  },
  botWrapper: { alignSelf: "flex-start", maxWidth: "85%" },
  userWrapper: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
    maxWidth: "80%",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BRAND.accentGlow,
    borderWidth: 1,
    borderColor: BRAND.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: { padding: 13, borderRadius: 18, flexShrink: 1 },
  botBubble: {
    backgroundColor: BRAND.card,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  userBubble: {
    backgroundColor: BRAND.accent,
    borderTopRightRadius: 4,
    elevation: 4,
  },
  msgText: { fontSize: 14, lineHeight: 20 },
  timestamp: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
    marginTop: 5,
    textAlign: "right",
  },
  quickSection: {
    paddingTop: 10,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.surface,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: BRAND.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quickScroll: { paddingHorizontal: 14, gap: 8 },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: BRAND.accentGlow,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BRAND.accent,
  },
  quickChipText: { fontSize: 13, fontWeight: "600", color: BRAND.accentSoft },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderColor: BRAND.border,
    alignItems: "flex-end",
    gap: 10,
    backgroundColor: BRAND.surface,
  },
  input: {
    flex: 1,
    backgroundColor: BRAND.card,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    color: BRAND.text,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND.accent,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
    paddingTop: 6,
    backgroundColor: BRAND.surface,
  },
  footerText: { fontSize: 10.5, color: BRAND.textMuted },
});
