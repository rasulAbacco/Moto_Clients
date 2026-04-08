import { TextInput, View, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function AppInput(props) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <TextInput
        {...props}
        style={[
          styles.input,
          {
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
        placeholderTextColor={theme.colors.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
});
