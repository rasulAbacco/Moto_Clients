import { Redirect } from "expo-router";
import { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthContext } from "../src/providers/AuthProvider";
import { VehicleContext } from "../src/providers/VehicleProvider";

export default function Index() {
  const { user, loading } = useContext(AuthContext);
  const {
    vehicles,
    loading: vehiclesLoading,
    error: vehiclesError,
  } = useContext(VehicleContext);

  // Wait for both auth + vehicles
  if (loading || vehiclesLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // No vehicle → vehicle setup. (If a logged-in user's vehicles just failed
  // to load — slow server / no signal — go home instead; they load later.)
  if ((!vehicles || vehicles.length === 0) && !(user && vehiclesError)) {
    return <Redirect href="/vehicle/type" />;
  }

  // Vehicle exists → home
  return <Redirect href="/(tabs)/home" />;
}
