import { Redirect } from "expo-router";
import { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthContext } from "../src/providers/AuthProvider";

export default function Index() {
  const { user, loading } = useContext(AuthContext);

  // Wait until auth state is resolved
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If user logged in → Home
  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  // If not logged in → Vehicle brand selection
  return <Redirect href="/vehicle/brand" />;
}
