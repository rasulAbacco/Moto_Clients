// Pay a shop directly by UPI (same flow as the MotorDesk website):
//   1. "Pay with UPI app" opens Google Pay / PhonePe / Paytm with amount + shop UPI ID filled in
//   2. Customer enters the UPI reference number (UTR) and taps "I've paid"
//   3. The shop checks its UPI app and confirms → order moves on
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import ScreenHeader from "../../components/common/ScreenHeader";
import { useTheme } from "../../hooks/useTheme";
import {
  cancelPartsOrder,
  getOrderUpi,
  orderErrorMessage,
  submitOrderUpi,
} from "../../services/spareParts.service";
import { formatPrice } from "../gostore/utils/price";
import { Card, Field, PrimaryButton } from "./ui";

const fmtTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

export default function UpiPayScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [upi, setUpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [utr, setUtr] = useState("");
  const [utrError, setUtrError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUpi(await getOrderUpi(id));
    } catch (err) {
      setError(orderErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const copy = async (text, what) => {
    await Clipboard.setStringAsync(String(text));
    Toast.show({ type: "success", text1: `${what} copied` });
  };

  const openUpiApp = async () => {
    try {
      await Linking.openURL(upi.upiLink);
    } catch {
      Toast.show({
        type: "error",
        text1: "No UPI app found",
        text2: "Copy the UPI ID and pay from any UPI app",
      });
    }
  };

  const submit = async () => {
    const value = utr.trim().toUpperCase();
    if (!/^[A-Z0-9]{10,22}$/.test(value)) {
      setUtrError(
        "Enter the UPI reference / UTR number from your UPI app (usually 12 digits)",
      );
      return;
    }
    setUtrError(null);
    setSubmitting(true);
    try {
      await submitOrderUpi(id, value);
      Toast.show({
        type: "success",
        text1: "Payment submitted",
        text2: `${upi.shopName} will confirm it shortly`,
      });
      router.replace(`/parts/orders/${id}`);
    } catch (err) {
      setUtrError(orderErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async () => {
    setCancelling(true);
    try {
      await cancelPartsOrder(id);
      Toast.show({ type: "info", text1: "Order cancelled" });
      router.replace("/parts/orders");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Couldn't cancel",
        text2: orderErrorMessage(err),
      });
    } finally {
      setCancelling(false);
    }
  };

  const alreadySubmitted =
    upi && (upi.upiRef || upi.status !== "AWAITING_PAYMENT");

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: c.background }}
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        title="Pay by UPI"
        subtitle={upi?.orderNumber ? `Order #${upi.orderNumber}` : undefined}
        onBack={() => router.replace(`/parts/orders/${id}`)}
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={36} color={c.textMuted} />
          <Text style={[styles.errorText, { color: c.textSecondary }]}>
            {error}
          </Text>
          <PrimaryButton title="Try again" onPress={load} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Card style={styles.amountCard}>
              <Text style={[styles.amountLabel, { color: c.textSecondary }]}>
                Amount to pay
              </Text>
              <Text style={[styles.amount, { color: c.text }]}>
                {formatPrice(upi.amount)}
              </Text>
              <Text style={[styles.payTo, { color: c.textSecondary }]}>
                to{" "}
                <Text style={{ color: c.text, fontWeight: "700" }}>
                  {upi.payeeName || upi.shopName}
                </Text>
              </Text>

              <Pressable
                onPress={() => copy(upi.upiId, "UPI ID")}
                style={[styles.copyRow, { borderColor: c.border }]}
              >
                <Text style={[styles.mono, { color: c.primary }]}>
                  {upi.upiId}
                </Text>
                <Ionicons name="copy-outline" size={16} color={c.primary} />
              </Pressable>
              {!!upi.upiNumber && (
                <Pressable
                  onPress={() => copy(upi.upiNumber, "UPI number")}
                  style={[styles.copyRow, { borderColor: c.border }]}
                >
                  <Text style={[styles.mono, { color: c.text }]}>
                    UPI number: {upi.upiNumber}
                  </Text>
                  <Ionicons
                    name="copy-outline"
                    size={16}
                    color={c.textSecondary}
                  />
                </Pressable>
              )}

              {!alreadySubmitted && (
                <PrimaryButton
                  title="Pay with UPI app"
                  icon="phone-portrait-outline"
                  onPress={openUpiApp}
                  style={{ marginTop: 14, alignSelf: "stretch" }}
                />
              )}
              {!!upi.payBy && !alreadySubmitted && (
                <View style={styles.payBy}>
                  <Ionicons name="time-outline" size={14} color={c.textMuted} />
                  <Text style={[styles.payByText, { color: c.textMuted }]}>
                    Pay by {fmtTime(upi.payBy)} — unpaid orders are released
                  </Text>
                </View>
              )}
            </Card>

            {alreadySubmitted ? (
              <Card style={{ marginTop: 14 }}>
                <View style={styles.doneRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={c.success}
                  />
                  <Text style={[styles.doneText, { color: c.text }]}>
                    {upi.paymentStatus === "PAID"
                      ? "Payment confirmed by the shop"
                      : `Payment submitted${upi.upiRef ? ` · ref ${upi.upiRef}` : ""}. The shop will confirm it.`}
                  </Text>
                </View>
                <PrimaryButton
                  title="View order"
                  variant="outline"
                  onPress={() => router.replace(`/parts/orders/${id}`)}
                  style={{ marginTop: 12 }}
                />
              </Card>
            ) : (
              <Card style={{ marginTop: 14 }}>
                <Text style={[styles.stepTitle, { color: c.text }]}>
                  After paying, enter the UPI reference number
                </Text>
                <Field
                  label="UTR / UPI Ref No."
                  value={utr}
                  onChangeText={(t) => setUtr(t.replace(/\s/g, ""))}
                  placeholder="12-digit number"
                  autoCapitalize="characters"
                  maxLength={22}
                  error={utrError}
                />
                <Text style={[styles.hint, { color: c.textMuted }]}>
                  Find it in your UPI app under the payment details (UPI Ref
                  No., UTR or Transaction ID).
                </Text>
                <PrimaryButton
                  title="I've paid"
                  icon="checkmark"
                  loading={submitting}
                  onPress={submit}
                  style={{ marginTop: 12 }}
                />
              </Card>
            )}

            <View style={styles.safeRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color={c.success}
              />
              <Text style={[styles.safeText, { color: c.textSecondary }]}>
                Only pay the exact amount shown, to the UPI ID shown.
              </Text>
            </View>

            {!alreadySubmitted && (
              <PrimaryButton
                title="Cancel this order"
                variant="danger"
                loading={cancelling}
                onPress={cancel}
                style={{ marginTop: 18 }}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  errorText: { fontSize: 14, textAlign: "center" },
  content: { padding: 16, paddingBottom: 32 },
  amountCard: { alignItems: "center", paddingVertical: 20 },
  amountLabel: { fontSize: 13 },
  amount: { fontSize: 34, fontWeight: "800", marginTop: 4 },
  payTo: { fontSize: 14, marginTop: 4, marginBottom: 12 },
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 6,
    alignSelf: "stretch",
    justifyContent: "space-between",
  },
  mono: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  payBy: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10 },
  payByText: { fontSize: 12 },
  stepTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  hint: { fontSize: 12, lineHeight: 17 },
  doneRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  doneText: { flex: 1, fontSize: 14, lineHeight: 20 },
  safeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    justifyContent: "center",
  },
  safeText: { fontSize: 12 },
});
