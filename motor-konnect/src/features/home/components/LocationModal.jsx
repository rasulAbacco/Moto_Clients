import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";

const CITIES = [
  { name: "Bengaluru", state: "Karnataka" },
  { name: "Mumbai", state: "Maharashtra" },
  { name: "Delhi", state: "Delhi NCR" },
  { name: "Hyderabad", state: "Telangana" },
  { name: "Chennai", state: "Tamil Nadu" },
  { name: "Pune", state: "Maharashtra" },
];

export default function LocationModal({
  visible,
  onClose,
  onSelect,
  selectedCity,
}) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.border,
            },
          ]}
          onPress={() => {}}
        >
          {/* Handle */}
          <View
            style={[styles.handle, { backgroundColor: theme.colors.border }]}
          />

          {/* Title row */}
          <View style={styles.titleRow}>
            <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
              Select City
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close"
                size={22}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* City list */}
          {CITIES.map((city, index) => {
            const isSelected = selectedCity === city.name;
            return (
              <TouchableOpacity
                key={city.name}
                onPress={() => {
                  onSelect(city.name);
                  onClose();
                }}
                style={[
                  styles.option,
                  index < CITIES.length - 1 && {
                    borderBottomWidth: 0.5,
                    borderBottomColor: theme.colors.border,
                  },
                  isSelected && {
                    backgroundColor: theme.colors.primary + "10",
                  },
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <View
                    style={[
                      styles.cityIcon,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary + "20"
                          : theme.colors.card || "#f5f5f5",
                      },
                    ]}
                  >
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={
                        isSelected
                          ? theme.colors.primary
                          : theme.colors.textSecondary
                      }
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.cityName,
                        {
                          color: isSelected
                            ? theme.colors.primary
                            : theme.colors.text,
                        },
                      ]}
                    >
                      {city.name}
                    </Text>
                    <Text
                      style={[
                        styles.stateName,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {city.state}
                    </Text>
                  </View>
                </View>

                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={theme.colors.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}

          {/* Bottom safe spacing */}
          {Platform.OS === "ios" && <View style={{ height: 20 }} />}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 0.5,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 18,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cityName: {
    fontSize: 15,
    fontWeight: "600",
  },
  stateName: {
    fontSize: 11,
    marginTop: 1,
  },
});
