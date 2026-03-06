import { createContext, useContext, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "./AuthProvider";
import { useTheme } from "../hooks/useTheme";
import { setToken } from "../services/storage.service";
import Toast from "react-native-toast-message";
const LoginSheetContext = createContext();
export const useLoginSheet = () => useContext(LoginSheetContext);

// ── 4-box OTP input ───────────────────────────────────────────────────────────
function OtpInput({ value, onChange, theme }) {
  const inputs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleKey = (text, index) => {
    const cleaned = text.replace(/\D/g, "").slice(-1);
    const next = value.split("");
    next[index] = cleaned;
    const joined = next.join("").slice(0, 6);
    onChange(joined);
    if (cleaned && index < 5) inputs.current[index + 1]?.focus();
    if (!cleaned && index > 0) inputs.current[index - 1]?.focus();
  };

  return (
    <View style={otpStyles.row}>
      {digits.map((d, i) => (
        <TextInput
          key={i}
          ref={(r) => (inputs.current[i] = r)}
          style={[
            otpStyles.box,
            {
              borderColor: d ? theme.colors.primary : theme.colors.border,
              backgroundColor: d
                ? theme.colors.primary + "10"
                : theme.colors.background,
              color: theme.colors.text,
            },
          ]}
          value={d}
          onChangeText={(t) => handleKey(t, i)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          selectTextOnFocus
        />
      ))}
    </View>
  );
}

const otpStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginVertical: 8,
  },
  box: {
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    fontSize: 22,
    fontWeight: "800",
  },
});

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  icon,
  theme,
}) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={[fieldStyles.label, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <View
        style={[
          fieldStyles.inputRow,
          {
            backgroundColor:
              theme.colors.card || theme.colors.surface || "#f9f9f9",
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={16}
          color={theme.colors.textSecondary}
          style={fieldStyles.icon}
        />
        <TextInput
          style={[fieldStyles.input, { color: theme.colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary + "80"}
          keyboardType={keyboardType || "default"}
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontWeight: "500" },
});

// ── Provider ──────────────────────────────────────────────────────────────────
export function LoginSheetProvider({ children }) {
  const { user, sendOtp, verifyOtp } = useAuth();
  const { theme } = useTheme();

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [resendTimer, setResendTimer] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Slide-up animation
  const slideY = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 12,
      }).start();
    } else {
      slideY.setValue(400);
    }
  }, [visible]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const openLoginSheet = () => {
    setVisible(true);
    setStep("form");
  };

  const closeLoginSheet = () => {
    setVisible(false);
    setTimeout(() => {
      setStep("form");
      setName("");
      setPhone("");
      setEmail("");
      setOtp("");
      setResendTimer(0);
    }, 300);
  };

  const handleSendOtp = async () => {
    if (!name.trim() || !phone.trim()) {
      alert("Name and Phone are required");
      return;
    }

    if (phone.length < 10) {
      alert("Enter a valid 10-digit phone number");
      return;
    }

    try {
      setLoading(true);

      // reset previous state
      setOtp("");
      setSuccessMsg("");
      setDevOtp(null);

      const res = await sendOtp({
        name,
        phone,
        email: email || undefined,
      });

      // show OTP only in development
      if (__DEV__) {
        setDevOtp(res?.otp);
      }

      Toast.show({
        type: "success",
        text1: "OTP Sent",
        text2: `OTP sent to +91 ${phone}`,
      });

      setStep("otp");
      setResendTimer(30);
    } catch (err) {
      console.log("Send OTP Error:", err?.response?.data || err);
      alert("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      await verifyOtp({
        name,
        phone,
        email,
        otp,
      });

      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: "Welcome back!",
      });

      setTimeout(() => {
        closeLoginSheet();
      }, 1200);
    } catch (err) {
      console.log("Verify OTP Error:", err.response?.data || err);

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: err?.response?.data?.message || "Invalid OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      setLoading(true);
      await sendOtp({ name, phone, email: email || undefined });

      Toast.show({
        type: "success",
        text1: "OTP Resent",
        text2: "Please check your phone",
      });

      setResendTimer(30);
      setOtp("");
    } catch {
      alert("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginSheetContext.Provider value={{ openLoginSheet, closeLoginSheet }}>
      {children}

      <Modal
        visible={visible && !user}
        animationType="none"
        transparent
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={closeLoginSheet}
      >
        <>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.overlay}
          >
            {/* Backdrop tap to close */}
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={closeLoginSheet}
              activeOpacity={1}
            />

            <Animated.View
              style={[
                styles.sheet,
                {
                  backgroundColor: theme.colors.background,
                  borderTopColor: theme.colors.border,
                  transform: [{ translateY: slideY }],
                },
              ]}
            >
              {/* Handle */}
              <View
                style={[
                  styles.handle,
                  { backgroundColor: theme.colors.border },
                ]}
              />

              {/* Close button */}
              <TouchableOpacity
                style={[
                  styles.closeBtn,
                  { backgroundColor: theme.colors.card },
                ]}
                onPress={closeLoginSheet}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color={theme.colors.text} />
              </TouchableOpacity>

              {/* ── FORM STEP ── */}
              {step === "form" && (
                <View style={styles.stepWrap}>
                  {/* Branding */}
                  <View style={styles.brandRow}>
                    <View
                      style={[
                        styles.brandIcon,
                        { backgroundColor: theme.colors.primary + "15" },
                      ]}
                    >
                      <Ionicons
                        name="car-sport-outline"
                        size={22}
                        color={theme.colors.primary}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.sheetTitle,
                          { color: theme.colors.text },
                        ]}
                      >
                        Login to Continue
                      </Text>
                      <Text
                        style={[
                          styles.sheetSubtitle,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        Enter your details to get started
                      </Text>
                    </View>
                  </View>

                  <Field
                    label="Full Name *"
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Rahul Sharma"
                    icon="person-outline"
                    theme={theme}
                  />
                  <Field
                    label="Phone Number *"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="10-digit mobile number"
                    keyboardType="phone-pad"
                    icon="call-outline"
                    theme={theme}
                  />
                  <Field
                    label="Email (Optional)"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    keyboardType="email-address"
                    icon="mail-outline"
                    theme={theme}
                  />

                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      { backgroundColor: theme.colors.primary },
                      loading && { opacity: 0.75 },
                    ]}
                    onPress={handleSendOtp}
                    disabled={loading}
                    activeOpacity={0.88}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.primaryBtnText}>Send OTP</Text>
                        <Ionicons name="arrow-forward" size={16} color="#fff" />
                      </>
                    )}
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.terms,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    By continuing, you agree to our{" "}
                    <Text style={{ color: theme.colors.primary }}>Terms</Text> &{" "}
                    <Text style={{ color: theme.colors.primary }}>
                      Privacy Policy
                    </Text>
                  </Text>
                </View>
              )}

              {/* ── OTP STEP ── */}
              {step === "otp" && (
                <View style={styles.stepWrap}>
                  {/* Back */}
                  <TouchableOpacity
                    style={styles.otpBack}
                    onPress={() => {
                      setStep("form");
                      setOtp("");
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={18}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[
                        styles.otpBackText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      Edit Details
                    </Text>
                  </TouchableOpacity>

                  <View
                    style={[
                      styles.otpIconWrap,
                      { backgroundColor: theme.colors.primary + "15" },
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={26}
                      color={theme.colors.primary}
                    />
                  </View>

                  <Text
                    style={[
                      styles.sheetTitle,
                      { color: theme.colors.text, textAlign: "center" },
                    ]}
                  >
                    Verify Your Number
                  </Text>
                  <Text
                    style={[
                      styles.otpSentTo,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    OTP sent to{" "}
                    <Text
                      style={{ color: theme.colors.text, fontWeight: "700" }}
                    >
                      +91 {phone}
                    </Text>
                  </Text>

                  {/* 4-box OTP */}
                  <OtpInput value={otp} onChange={setOtp} theme={theme} />

                  {/* Dev hint */}
                  {devOtp && (
                    <View
                      style={[
                        styles.devHint,
                        { backgroundColor: theme.colors.card },
                      ]}
                    >
                      <Ionicons
                        name="bug-outline"
                        size={14}
                        color={theme.colors.primary}
                      />
                      <Text
                        style={[
                          styles.devHintText,
                          { color: theme.colors.text },
                        ]}
                      >
                        Dev OTP:{" "}
                        <Text style={{ fontWeight: "700" }}>{devOtp}</Text>
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      {
                        backgroundColor:
                          otp.length === 6
                            ? theme.colors.primary
                            : theme.colors.primary + "50",
                      },
                      loading && { opacity: 0.75 },
                    ]}
                    onPress={handleVerifyOtp}
                    disabled={loading || otp.length < 6}
                    activeOpacity={0.88}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.primaryBtnText}>
                          Verify & Continue
                        </Text>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={16}
                          color="#fff"
                        />
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Resend */}
                  <TouchableOpacity
                    style={styles.resendRow}
                    onPress={handleResend}
                    disabled={resendTimer > 0}
                  >
                    <Text
                      style={[
                        styles.resendText,
                        {
                          color:
                            resendTimer > 0
                              ? theme.colors.textSecondary
                              : theme.colors.primary,
                        },
                      ]}
                    >
                      {resendTimer > 0
                        ? `Resend OTP in ${resendTimer}s`
                        : "Resend OTP"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </KeyboardAvoidingView>
        </>
      </Modal>
    </LoginSheetContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    borderTopWidth: 0.5,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  closeBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stepWrap: {
    paddingTop: 4,
  },

  // Branding
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  brandIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  sheetSubtitle: {
    fontSize: 13,
  },

  // Primary button
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  // Terms
  terms: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 17,
  },

  // OTP step
  otpBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  otpBackText: { fontSize: 14, fontWeight: "600" },
  otpIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  otpSentTo: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 19,
  },
  devHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  devHintText: { fontSize: 12 },
  resendRow: {
    alignItems: "center",
    paddingVertical: 12,
  },
  resendText: { fontSize: 13, fontWeight: "600" },
});
