import { Redirect } from "expo-router";
import { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthContext } from "../src/providers/AuthProvider";
import { VehicleContext } from "../src/providers/VehicleProvider";


export default function Index() {
  const { user, loading } = useContext(AuthContext);
  const { vehicles, loading: vehiclesLoading } = useContext(VehicleContext);

  // Wait for both auth + vehicles
  if (loading || vehiclesLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // No vehicle → vehicle setup
  if (!vehicles || vehicles.length === 0) {
    return <Redirect href="/vehicle/type" />;
  }

  // Vehicle exists → home
  return <Redirect href="/(tabs)/home" />;
}
