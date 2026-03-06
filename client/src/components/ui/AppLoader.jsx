import { ActivityIndicator, View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function AppLoader() {
  const { theme } = useTheme();

  return (
    <View style={{ marginTop: 20 }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}
