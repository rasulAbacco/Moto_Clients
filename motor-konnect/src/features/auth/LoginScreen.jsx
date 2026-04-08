import { useState, useContext } from "react";
import { View } from "react-native";
import { AuthContext } from "../../providers/AuthProvider";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import KeyboardWrapper from "../../components/layout/KeyboardWrapper";
import AppHeader from "../../components/ui/AppHeader";
import AppInput from "../../components/ui/AppInput";
import AppButton from "../../components/ui/AppButton";

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await login({ email, password });
    setLoading(false);
  };

  return (
    <ScreenWrapper>
      <KeyboardWrapper>
        <AppHeader title="Login" />
        <AppInput placeholder="Email" value={email} onChangeText={setEmail} />
        <AppInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <AppButton title="Login" onPress={handleLogin} loading={loading} />
      </KeyboardWrapper>
    </ScreenWrapper>
  );
}
