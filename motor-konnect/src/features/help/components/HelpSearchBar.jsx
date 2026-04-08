import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTheme } from "../../../hooks/useTheme";

export default function HelpSearchBar({ onSearch }) {
  const { theme } = useTheme();
  const [query, setQuery] = useState("");

  const handleChange = (text) => {
    setQuery(text);
    onSearch?.(text);
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card || theme.colors.surface || "#fff",
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Ionicons
        name="search-outline"
        size={18}
        color={theme.colors.textSecondary}
        style={styles.searchIcon}
      />

      <TextInput
        value={query}
        onChangeText={handleChange}
        placeholder="Search help topics..."
        placeholderTextColor={theme.colors.textSecondary + "80"}
        style={[styles.input, { color: theme.colors.text }]}
        returnKeyType="search"
        autoCorrect={false}
      />

      {query.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
});
