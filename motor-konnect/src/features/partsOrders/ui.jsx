// Small shared UI for the spare-parts buying screens (cart, checkout, pay, orders).
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

export function Card({ children, style }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ children, right }) {
  const { theme } = useTheme();
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.section, { color: theme.colors.textSecondary }]}>
        {children}
      </Text>
      {right}
    </View>
  );
}

/** Radio-style option card */
export function OptionRow({
  icon,
  title,
  subtitle,
  selected,
  onPress,
  disabled,
  right,
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      style={[
        styles.option,
        {
          borderColor: selected ? c.primary : c.border,
          backgroundColor: selected ? c.primarySoft : c.surface,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.optionIcon,
          { backgroundColor: selected ? c.primaryLight : c.inputBackground },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={selected ? c.primary : c.textSecondary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionTitle, { color: c.text }]}>{title}</Text>
        {!!subtitle && (
          <Text style={[styles.optionSub, { color: c.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        size={22}
        color={selected ? c.primary : c.textMuted}
      />
    </Pressable>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  icon,
  variant = "primary",
  style,
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  const outline = variant === "outline";
  const danger = variant === "danger";
  const fg = outline ? c.primary : danger ? c.danger : c.onPrimary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        outline || danger
          ? {
              borderWidth: 1.5,
              borderColor: danger ? c.danger : c.primary,
              backgroundColor: c.surface,
            }
          : { backgroundColor: c.primary },
        { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {!!icon && <Ionicons name={icon} size={18} color={fg} />}
          <Text style={[styles.btnText, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Field({ label, error, style, ...props }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <TextInput
        placeholderTextColor={c.textMuted}
        style={[
          styles.input,
          {
            color: c.text,
            borderColor: error ? c.danger : c.border,
            backgroundColor: c.surface,
          },
        ]}
        {...props}
      />
      {!!error && (
        <Text style={[styles.error, { color: c.danger }]}>{error}</Text>
      )}
    </View>
  );
}

export function QtyStepper({ value, onChange, max = 50 }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={[styles.stepper, { borderColor: c.border }]}>
      <Pressable
        onPress={() => onChange(value - 1)}
        hitSlop={6}
        style={styles.stepBtn}
        accessibilityLabel={value > 1 ? "Decrease quantity" : "Remove"}
      >
        <Ionicons
          name={value > 1 ? "remove" : "trash-outline"}
          size={16}
          color={value > 1 ? c.text : c.danger}
        />
      </Pressable>
      <Text style={[styles.stepQty, { color: c.text }]}>{value}</Text>
      <Pressable
        onPress={() => value < max && onChange(value + 1)}
        hitSlop={6}
        style={styles.stepBtn}
        accessibilityLabel="Increase quantity"
      >
        <Ionicons
          name="add"
          size={16}
          color={value < max ? c.text : c.textMuted}
        />
      </Pressable>
    </View>
  );
}

export function StatusPill({ text, tone = "neutral" }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const map = {
    neutral: [c.primaryLight, c.primary],
    good: [c.successSoft, c.success],
    warn: [c.warningSoft, c.warning],
    bad: [c.dangerSoft, c.danger],
  };
  const [bg, fg] = map[tone] || map.neutral;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{text}</Text>
    </View>
  );
}

export function Line({ label, value, bold, muted }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={styles.line}>
      <Text
        style={[
          bold ? styles.lineBold : styles.lineText,
          { color: muted ? c.textSecondary : c.text },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          bold ? styles.lineBold : styles.lineText,
          { color: muted ? c.textSecondary : c.text },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 14 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 8,
  },
  section: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitle: { fontSize: 15, fontWeight: "600" },
  optionSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  btn: {
    height: 50,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  btnText: { fontSize: 15, fontWeight: "700" },
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 15,
  },
  error: { fontSize: 12, marginTop: 4 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    height: 34,
  },
  stepBtn: {
    width: 32,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  stepQty: {
    minWidth: 22,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  pillText: { fontSize: 11, fontWeight: "700" },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  lineText: { fontSize: 14 },
  lineBold: { fontSize: 16, fontWeight: "700" },
});
