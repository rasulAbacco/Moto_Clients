import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../../hooks/useTheme";

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
