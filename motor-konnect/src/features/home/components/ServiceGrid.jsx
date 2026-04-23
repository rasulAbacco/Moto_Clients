import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme.js";
import { useRouter, useLocalSearchParams } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 32 - 12) / 2;

const ICON_MAP = {
  default: "construct-outline",
  tyre: "ellipse-outline",
  battery: "battery-charging-outline",
  service: "settings-outline",
  wash: "water-outline",
  ac: "thermometer-outline",
  denting: "hammer-outline",
};

export default function ServiceGrid() {
  const { theme } = useTheme();
  const router = useRouter();

  // ✅ RECEIVE DATA FROM PREVIOUS SCREEN (GarageList)
  const { garageId, garageName, services, garage } = useLocalSearchParams();

  // parse services for grid display
  let parsedServices = [];
  try {
    parsedServices = services ? JSON.parse(services) : [];
  } catch (e) {
    parsedServices = [];
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {garageName || "Services"}
        </Text>
      </View>

      {/* Empty State */}
      {!parsedServices.length ? (
        <Text style={styles.emptyText}>No services available</Text>
      ) : (
        <View style={styles.grid}>
          {parsedServices.map((main) => {
            const iconKey = main.name?.toLowerCase() || "default";
            const iconName = ICON_MAP[iconKey] || ICON_MAP.default;

            return (
              <TouchableOpacity
                key={main.id}
                style={[
                  styles.card,
                  {
                    backgroundColor:
                      theme.colors.card || theme.colors.surface || "#fff",
                    borderColor: theme.colors.border,
                  },
                ]}
                activeOpacity={0.75}
                onPress={() =>
                  router.push({
                    pathname: "/services/[id]",
                    params: {
                      id: main.id,
                      mainService: JSON.stringify(main),
                      title: main.name,

                      // ✅ FORWARD FULL CONTEXT
                      // These params ensure the next screen has everything needed for the cart
                      garageId: garageId,
                      garageName: garageName,
                      garage: garage, // Full stringified item (address, phone, email included)
                    },
                  })
                }
              >
                {/* Icon */}
                <View
                  style={[
                    styles.iconWrap,
                    {
                      backgroundColor: theme.colors.primary + "15",
                    },
                  ]}
                >
                  <Ionicons
                    name={iconName}
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>

                {/* Name */}
                <Text
                  style={[styles.name, { color: theme.colors.text }]}
                  numberOfLines={2}
                >
                  {main.name}
                </Text>

                {/* Arrow */}
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={theme.colors.textSecondary}
                  style={styles.arrow}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    opacity: 0.6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: CARD_SIZE,
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    elevation: 3,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  arrow: {
    position: "absolute",
    top: 14,
    right: 12,
  },
});
