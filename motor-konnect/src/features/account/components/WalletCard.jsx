import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function WalletCard() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card || theme.colors.surface || "#fff",
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => router.push("/wallet")}
      activeOpacity={0.85}
    >
      {/* Left: balance info */}
      <View style={styles.left}>
        <View style={styles.labelRow}>
          <View
            style={[
              styles.walletIconWrap,
              { backgroundColor: theme.colors.primary + "15" },
            ]}
          >
            <Ionicons
              name="wallet-outline"
              size={16}
              color={theme.colors.primary}
            />
          </View>
          <Text
            style={[styles.walletLabel, { color: theme.colors.textSecondary }]}
          >
            GoApp Money
          </Text>
        </View>

        <Text style={[styles.amount, { color: theme.colors.text }]}>
          ₹ 4,550
        </Text>

        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
          Tap to view transactions
        </Text>
      </View>

      {/* Right: Add Money button */}
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push("/wallet/add")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={16} color="#fff" />
        <Text style={styles.addBtnText}>Add{"\n"}Money</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 0.5,
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  left: {
    flex: 1,
    gap: 4,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  walletIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  walletLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  amount: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  hint: {
    fontSize: 11,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 4,
    marginLeft: 12,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 15,
  },
});
