import { View, StyleSheet } from "react-native";
import AppText from "./AppText";

export default function AppHeader({ title }) {
  return (
    <View style={styles.container}>
      <AppText variant="title">{title}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
});
