import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../../../providers/AuthProvider";
import Toast from "react-native-toast-message";

export default function AccountFooter() {
  const { theme } = useTheme();
  const { logout } = useContext(AuthContext);
  const router = useRouter();

  const links = [
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" },
    { label: "About", path: "/about" },
  ];

  return (
    <View style={styles.container}>
      {/* Links row */}
      <View style={styles.linksRow}>
        {links.map((link, index) => (
          <View key={link.label} style={styles.linkWrap}>
            <TouchableOpacity onPress={() => router.navigate(link.path)}>
              <Text
                style={[styles.link, { color: theme.colors.textSecondary }]}
              >
                {link.label}
              </Text>
            </TouchableOpacity>
            {index < links.length - 1 && (
              <Text style={[styles.dot, { color: theme.colors.textSecondary }]}>
                ·
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          await logout();

          Toast.show({
            type: "success",
            text1: "Logged Out",
            text2: "You have been logged out successfully",
          });

          setTimeout(() => {
            router.replace("/");
          }, 800);
        }}
      >
        <Text
          style={[
            styles.logoutText,
            { color: theme.colors.error || "#ef4444" },
          ]}
        >
          Log Out
        </Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
        Version 1.0.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    alignItems: "center",
    gap: 12,
    paddingBottom: 8,
  },
  linksRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
  },
  linkWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  link: {
    fontSize: 12,
  },
  dot: {
    fontSize: 14,
    opacity: 0.5,
  },
  logoutBtn: {
    paddingVertical: 4,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
  },
  version: {
    fontSize: 11,
    opacity: 0.5,
  },
});
