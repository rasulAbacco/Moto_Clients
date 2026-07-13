import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../../hooks/useTheme";

// ✅ REVERTED: this is "WASH" again, not "WASHING". Turns out there are
// TWO separate category systems in the backend:
//   1. CrmType enum (CAR/BIKE/WASH) — used by /api/packages, and now by
//      MarketplaceService.crmType (the real field that drives category
//      filtering on Home). This one is "WASH".
//   2. VehicleType lookup table (CAR/BIKE/WASHING) — used only by the
//      separate generic /api/services catalog. This one is "WASHING",
//      but that endpoint degrades gracefully on a mismatch (shows
//      everything unfiltered) instead of crashing.
// Sending "WASHING" here broke /api/packages the same way "SEDAN" did
// originally (`invalid input value for enum "CrmType"`), and would never
// match MarketplaceService.crmType either. "WASH" is correct for both of
// the things that actually matter.
const VEHICLES = [
  { key: "CAR", label: "Car" },
  { key: "BIKE", label: "Bike" },
  { key: "WASH", label: "Washing" },
];

export default function VehicleSelector({ selected, onChange }) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {VEHICLES.map((item) => {
        const active = selected === item.key;

        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => onChange(item.key)}
            activeOpacity={0.8}
            style={[
              styles.button,
              {
                backgroundColor: active
                  ? theme.colors.primary
                  : theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: active ? "#fff" : theme.colors.text,
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 0.6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
