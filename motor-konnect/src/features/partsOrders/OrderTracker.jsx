// Order progress. Pickup orders: Placed → Accepted → Ready → Picked up (no "Shipped").
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

const DELIVERY_STEPS = [
  ["PENDING", "Placed"],
  ["ACCEPTED", "Accepted"],
  ["PACKED", "Packed"],
  ["SHIPPED", "Shipped"],
  ["DELIVERED", "Delivered"],
];
const PICKUP_STEPS = [
  ["PENDING", "Placed"],
  ["ACCEPTED", "Accepted"],
  ["PACKED", "Ready"],
  ["DELIVERED", "Picked up"],
];

export default function OrderTracker({ status, fulfilment }) {
  const { theme } = useTheme();
  const c = theme.colors;

  if (status === "CANCELLED") {
    return (
      <View style={styles.cancelled}>
        <Ionicons name="close-circle" size={18} color={c.danger} />
        <Text style={[styles.cancelledText, { color: c.danger }]}>
          Order cancelled
        </Text>
      </View>
    );
  }
  if (status === "AWAITING_PAYMENT") {
    return (
      <View style={styles.cancelled}>
        <Ionicons name="time-outline" size={18} color={c.warning} />
        <Text style={[styles.cancelledText, { color: c.warning }]}>
          Waiting for your UPI payment
        </Text>
      </View>
    );
  }

  const steps = fulfilment === "PICKUP" ? PICKUP_STEPS : DELIVERY_STEPS;
  const current = steps.findIndex(([s]) => s === status);

  return (
    <View style={styles.row}>
      {steps.map(([key, label], i) => {
        const done = i <= current;
        return (
          <View
            key={key}
            style={[styles.step, i < steps.length - 1 && { flex: 1 }]}
          >
            <View style={styles.dotCol}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: done ? c.primary : c.border },
                ]}
              >
                {i < current ? (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                ) : (
                  <Text style={styles.dotNum}>{i + 1}</Text>
                )}
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  { color: done ? c.primary : c.textMuted },
                ]}
              >
                {label}
              </Text>
            </View>
            {i < steps.length - 1 && (
              <View
                style={[
                  styles.bar,
                  { backgroundColor: i < current ? c.primary : c.border },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start" },
  step: { flexDirection: "row", alignItems: "flex-start" },
  dotCol: { alignItems: "center", width: 58 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dotNum: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  label: { fontSize: 11, marginTop: 4, fontWeight: "600" },
  bar: { flex: 1, height: 2, marginTop: 11, marginHorizontal: -16 },
  cancelled: { flexDirection: "row", alignItems: "center", gap: 6 },
  cancelledText: { fontSize: 14, fontWeight: "700" },
});
