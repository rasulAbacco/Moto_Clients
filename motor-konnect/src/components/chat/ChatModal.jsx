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
  StatusBar,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

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
    label: "Book a Service",
    text: "I'd like to book a vehicle service appointment.",
  },
  {
    id: "q2",
    icon: "construct-outline",
    label: "Oil Change",
    text: "How much does an oil change cost?",
  },
  {
    id: "q3",
    icon: "alert-circle-outline",
    label: "Warning Light",
    text: "My dashboard warning light is on. What should I do?",
  },
  {
    id: "q4",
    icon: "battery-charging-outline",
    label: "Battery Check",
    text: "I need a battery check for my car.",
  },
  {
    id: "q5",
    icon: "time-outline",
    label: "Wait Time",
    text: "What is the current estimated wait time for repairs?",
  },
  {
    id: "q6",
    icon: "cash-outline",
    label: "Get a Quote",
    text: "Can I get a repair quote for my vehicle?",
  },
];

const BOT_REPLIES = {
  q1: "Sure! We're open Mon–Sat, 8AM–6PM. You can book online or call us at **1-800-GARAGE**. Which day works best for you?",
  q2: "A standard oil change starts at **$39.99** for conventional oil and **$69.99** for full synthetic. Includes a 21-point inspection — free of charge! 🔧",
  q3: "Don't ignore it! Common causes include a loose gas cap, low oil pressure, or O2 sensor issues. Bring it in for a **free diagnostic scan** today.",
  q4: "We offer free battery testing and load checks in under 10 minutes — no appointment needed! Just drive in anytime. 🔋",
  q5: "Current average wait time is **45–60 minutes** for standard services. Express bay is available for oil changes & tire rotations.",
  q6: "Happy to help with a quote! Please share your vehicle's **year, make, model**, and describe the issue. We'll get back to you within 24 hours. 🚗",
  default:
    "Thanks for reaching out! One of our service advisors will get back to you shortly. For urgent issues, please call **1-800-GARAGE** or visit us in person. 🔧",
};

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

export default function ChatModal({ visible, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "👋 Welcome to **GarageAssist**! I'm here to help with all your vehicle service needs. Pick a quick option below or type your question.",
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
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const addMessages = (userMsg, botMsg) => {
    const ids = new Set([userMsg.id, botMsg.id]);
    setNewMsgIds(ids);
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);
    setShowQuick(false);

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, botMsg]);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }, 1400);
  };

  const handleQuick = (q) => {
    const userMsg = {
      id: `u-${Date.now()}`,
      text: q.text,
      bot: false,
      time: now(),
    };
    const botMsg = {
      id: `b-${Date.now()}`,
      text: BOT_REPLIES[q.id] || BOT_REPLIES["default"],
      bot: true,
      time: now(),
    };
    addMessages(userMsg, botMsg);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = {
      id: `u-${Date.now()}`,
      text: input.trim(),
      bot: false,
      time: now(),
    };
    const botMsg = {
      id: `b-${Date.now()}`,
      text: "Thanks for your message! Our support team will review it and get back to you shortly. For immediate help, call **1-800-GARAGE** 🚗",
      bot: true,
      time: now(),
    };
    setInput("");
    addMessages(userMsg, botMsg);
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoWrap}>
                <Ionicons name="car-sport" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>GarageAssist</Text>
                <View style={styles.onlineRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Support team online</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={BRAND.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
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

          {/* Quick replies */}
          {showQuick && (
            <View style={styles.quickSection}>
              <Text style={styles.quickLabel}>Quick Options</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickScroll}
              >
                {QUICK_QUESTIONS.map((q) => (
                  <TouchableOpacity
                    key={q.id}
                    style={styles.quickChip}
                    onPress={() => handleQuick(q)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name={q.icon} size={14} color={BRAND.accent} />
                    <Text style={styles.quickChipText}>{q.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.inputRow}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask anything about your vehicle..."
                placeholderTextColor={BRAND.textMuted}
                style={styles.input}
                multiline
                maxLength={300}
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity
                onPress={sendMessage}
                style={[styles.sendBtn, { opacity: input.trim() ? 1 : 0.4 }]}
                activeOpacity={0.8}
                disabled={!input.trim()}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.footer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={11}
                color={BRAND.textMuted}
              />
              <Text style={styles.footerText}>
                Powered by GarageAssist · Secure & Private
              </Text>
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
  // Header
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
    shadowColor: BRAND.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
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
  // Messages
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
  bubble: {
    padding: 13,
    borderRadius: 18,
    flexShrink: 1,
  },
  botBubble: {
    backgroundColor: BRAND.card,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  userBubble: {
    backgroundColor: BRAND.accent,
    borderTopRightRadius: 4,
    shadowColor: BRAND.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  msgText: { fontSize: 14, lineHeight: 20 },
  timestamp: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
    marginTop: 5,
    textAlign: "right",
  },
  // Quick replies
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
  // Input
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
    shadowColor: BRAND.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
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
