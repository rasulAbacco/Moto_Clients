import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../providers/AuthProvider";
import { useRouter } from "expo-router";
import api from "../../../services/apiClient";
import { Buffer } from "buffer";
import NotificationPanel from "./NotificationPanel";

const { width } = Dimensions.get("window");

export default function AccountHeader() {
  const { theme } = useTheme();
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const [imageUrl, setImageUrl] = useState(null);
  const [notifVisible, setNotifVisible] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const res = await api.get("/auth/profile-image", {
          responseType: "arraybuffer",
        });
        const base64 = `data:image/jpeg;base64,${Buffer.from(res.data).toString("base64")}`;
        setImageUrl(base64);
      } catch {
        setImageUrl(null);
      }
    };
    if (user) loadImage();
  }, [user]);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.left}>
          {/* Avatar */}
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.colors.primary + "20" },
              ]}
            >
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.initials, { color: theme.colors.primary }]}>
                  {initials}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Name & phone */}
          <View style={styles.textWrap}>
            <Text
              style={[styles.greeting, { color: theme.colors.textSecondary }]}
            >
              Welcome back 👋
            </Text>
            <Text
              style={[styles.name, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {user?.name || "Guest"}
            </Text>
            <Text style={[styles.phone, { color: theme.colors.textSecondary }]}>
              {user?.phone || user?.email || ""}
            </Text>
          </View>
        </View>

        {/* Notification bell — opens panel instead of navigating */}
        <TouchableOpacity
          style={[
            styles.notifBtn,
            { backgroundColor: theme.colors.card || theme.colors.surface },
          ]}
          onPress={() => setNotifVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={theme.colors.text}
          />
          {/* Badge */}
          <View
            style={[styles.badge, { backgroundColor: theme.colors.primary }]}
          />
        </TouchableOpacity>
      </View>

      {/* Notification bottom-sheet */}
      <NotificationPanel
        visible={notifVisible}
        onClose={() => setNotifVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    marginTop: 4,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  initials: {
    fontSize: 18,
    fontWeight: "800",
  },
  textWrap: {
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    marginBottom: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 22,
  },
  phone: {
    fontSize: 13,
    marginTop: 1,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
});