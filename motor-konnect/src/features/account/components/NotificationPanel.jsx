import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  ScrollView,
  Dimensions,
  PanResponder,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { useRef, useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../../../providers/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../services/apiClient";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.78;

const TABS = ["All", "Unread", "Offers"];

// Keys scoped per user phone — different users on same device stay isolated
const storageKey = (phone, suffix) =>
  `notifications:${phone || "guest"}:${suffix}`;

export default function NotificationPanel({ visible, onClose }) {
  const { theme } = useTheme();
  const { user } = useContext(AuthContext);
  const phone = user?.phone || user?.phoneNumber || null;

  const slideAnim    = useRef(new Animated.Value(PANEL_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // ─── State ────────────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [activeTab, setActiveTab]         = useState("All");
  const [readIds, setReadIds]             = useState(new Set());
  const [clearedIds, setClearedIds]       = useState(new Set());

  // ─── Load persisted sets from AsyncStorage on mount ──────────────────────
  const loadPersistedState = useCallback(async () => {
    try {
      const [rawRead, rawCleared] = await Promise.all([
        AsyncStorage.getItem(storageKey(phone, "read")),
        AsyncStorage.getItem(storageKey(phone, "cleared")),
      ]);
      if (rawRead)    setReadIds(new Set(JSON.parse(rawRead)));
      if (rawCleared) setClearedIds(new Set(JSON.parse(rawCleared)));
    } catch (err) {
      console.error("NOTIF STORAGE LOAD ERROR:", err);
    }
  }, [phone]);

  useEffect(() => {
    loadPersistedState();
  }, [loadPersistedState]);

  // ─── Persist helpers ──────────────────────────────────────────────────────
  const saveReadIds = async (nextSet) => {
    try {
      await AsyncStorage.setItem(
        storageKey(phone, "read"),
        JSON.stringify([...nextSet])
      );
    } catch (err) {
      console.error("NOTIF STORAGE WRITE (read) ERROR:", err);
    }
  };

  const saveClearedIds = async (nextSet) => {
    try {
      await AsyncStorage.setItem(
        storageKey(phone, "cleared"),
        JSON.stringify([...nextSet])
      );
    } catch (err) {
      console.error("NOTIF STORAGE WRITE (cleared) ERROR:", err);
    }
  };

  // ─── Fetch from app backend ───────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = phone ? { phone } : {};
      const res = await api.get("/notifications", { params });
      if (res.data?.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error("NOTIFICATION FETCH ERROR:", err?.message);
    } finally {
      setLoading(false);
    }
  }, [phone]);

useEffect(() => {
  if (visible) {
    setNotifications([]);   // 🔥 reset old data
    fetchNotifications();   // 🔥 fetch fresh
  }
}, [visible]);

  // ─── Animation ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 180,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: PANEL_HEIGHT,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // ─── Swipe-to-dismiss ─────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 8,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) slideAnim.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 120 || gs.vy > 0.8) {
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 180,
          }).start();
        }
      },
    })
  ).current;

  // ─── Actions ──────────────────────────────────────────────────────────────

  // Tap a notification row → mark as read
  const markRead = useCallback((id) => {
    setReadIds((prev) => {
      const next = new Set([...prev, id]);
      saveReadIds(next);
      return next;
    });
  }, [phone]);

  // Mark all visible as read
  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set([...prev, ...notifications.map((n) => n.id)]);
      saveReadIds(next);
      return next;
    });
  }, [notifications, phone]);

  // Dismiss (X) on a single row → cleared permanently for this user
  const clearOne = useCallback((id) => {
    // Mark read too so the unread count doesn't flicker
    setReadIds((prev) => {
      const next = new Set([...prev, id]);
      saveReadIds(next);
      return next;
    });
    setClearedIds((prev) => {
      const next = new Set([...prev, id]);
      saveClearedIds(next);
      return next;
    });
  }, [phone]);

  // Clear all → hides everything currently visible for this user
  const clearAll = useCallback(() => {
    Alert.alert(
      "Clear All Notifications",
      "All notifications will be hidden. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            const allIds = notifications.map((n) => n.id);
            setReadIds((prev) => {
              const next = new Set([...prev, ...allIds]);
              saveReadIds(next);
              return next;
            });
            setClearedIds((prev) => {
              const next = new Set([...prev, ...allIds]);
              saveClearedIds(next);
              return next;
            });
          },
        },
      ]
    );
  }, [notifications, phone]);

  // ─── Derived data ─────────────────────────────────────────────────────────
  const isUnread  = (n) => !readIds.has(n.id);
  const isCleared = (n) => clearedIds.has(n.id);

  // Remove cleared items before any tab filtering
  const visibleNotifications = notifications.filter((n) => !isCleared(n));

  const filtered = visibleNotifications.filter((n) => {
    if (activeTab === "Unread") return isUnread(n);
    if (activeTab === "Offers") return n.type === "NEW_PACKAGE";
    return true;
  });

  const unreadCount = visibleNotifications.filter(isUnread).length;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropAnim }]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            backgroundColor: theme.colors.background,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.panelTitle, { color: theme.colors.text }]}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          <View style={styles.headerRight}>
            {/* Mark all read — only shown when there are unread items */}
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.headerActionBtn}
                onPress={markAllRead}
                activeOpacity={0.7}
              >
                <Text style={[styles.headerActionText, { color: theme.colors.primary }]}>
                  Mark all read
                </Text>
              </TouchableOpacity>
            )}

            {/* Clear all — only shown when there are visible notifications */}
            {visibleNotifications.length > 0 && (
              <TouchableOpacity
                style={styles.headerActionBtn}
                onPress={clearAll}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.headerActionText,
                    { color: theme.colors.error || "#ef4444" },
                  ]}
                >
                  Clear all
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.closeBtn,
                { backgroundColor: theme.colors.card || theme.colors.surface },
              ]}
              onPress={onClose}
              activeOpacity={0.75}
            >
              <Ionicons name="close" size={18} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab pills */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabPill,
                  active
                    ? { backgroundColor: theme.colors.primary }
                    : {
                        backgroundColor: theme.colors.card || theme.colors.surface,
                        borderWidth: 0.5,
                        borderColor: theme.colors.border,
                      },
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    { color: active ? "#fff" : theme.colors.textSecondary },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading notifications…
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {filtered.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons
                  name="notifications-off-outline"
                  size={40}
                  color={theme.colors.textSecondary}
                  style={{ opacity: 0.4, marginBottom: 10 }}
                />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  {activeTab === "Unread"
                    ? "All caught up! No unread notifications."
                    : activeTab === "Offers"
                    ? "No offers right now. Check back soon!"
                    : "No notifications yet."}
                </Text>
              </View>
            ) : (
              <>
                {filtered.map((notif, index) => {
                  const unread = isUnread(notif);
                  return (
                    <TouchableOpacity
                      key={notif.id + notif.createdAt}
                      activeOpacity={0.75}
                      onPress={() => markRead(notif.id)}
                      style={[
                        styles.notifRow,
                        {
                          backgroundColor: unread
                            ? theme.colors.primary + "08"
                            : theme.colors.card || theme.colors.surface,
                          borderColor: theme.colors.border,
                        },
                        index === filtered.length - 1 && { marginBottom: 0 },
                      ]}
                    >
                      {/* Icon */}
                      <View style={[styles.notifIcon, { backgroundColor: notif.iconBg }]}>
                        <Ionicons name={notif.icon} size={20} color={notif.iconColor} />
                      </View>

                      {/* Content */}
                      <View style={styles.notifContent}>
                        <View style={styles.notifTopRow}>
                          <Text
                            style={[
                              styles.notifTitle,
                              {
                                color: theme.colors.text,
                                fontWeight: unread ? "700" : "600",
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {notif.title}
                          </Text>
                          <Text
                            style={[styles.notifTime, { color: theme.colors.textSecondary }]}
                          >
                            {notif.time}
                          </Text>
                        </View>
                        <Text
                          style={[styles.notifBody, { color: theme.colors.textSecondary }]}
                          numberOfLines={2}
                        >
                          {notif.body}
                        </Text>
                        {notif.garageName && (
                          <Text style={[styles.garageTag, { color: theme.colors.primary }]}>
                            {notif.garageName}
                          </Text>
                        )}
                      </View>

                      {/* Right column: unread dot + dismiss X */}
                      <View style={styles.notifRight}>
                        {unread && (
                          <View
                            style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]}
                          />
                        )}
                        <TouchableOpacity
                          style={styles.clearBtn}
                          onPress={() => clearOne(notif.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          activeOpacity={0.6}
                        >
                          <Ionicons
                            name="close"
                            size={13}
                            color={theme.colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                <View style={styles.endNote}>
                  <Text style={[styles.endNoteText, { color: theme.colors.textSecondary }]}>
                    You're all caught up 🎉
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: PANEL_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  handleArea: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  unreadBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  headerActionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 8,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 16,
    borderWidth: 0.5,
    gap: 12,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    gap: 4,
  },
  notifTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  notifTitle: {
    fontSize: 14,
    flex: 1,
  },
  notifTime: {
    fontSize: 11,
    flexShrink: 0,
  },
  notifBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  garageTag: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  notifRight: {
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
    paddingTop: 2,
    flexShrink: 0,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  clearBtn: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    opacity: 0.5,
  },
  endNote: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 4,
  },
  endNoteText: {
    fontSize: 13,
  },
});