import { useState, useContext } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import KeyboardWrapper from "../../components/layout/KeyboardWrapper";
import AppHeader from "../../components/ui/AppHeader";
import AppInput from "../../components/ui/AppInput";
import AppButton from "../../components/ui/AppButton";

export default function RegisterScreen() {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    await register({ name, email, password });
  };

  return (
    <ScreenWrapper>
      <KeyboardWrapper>
        <AppHeader title="Register" />
        <AppInput placeholder="Full Name" value={name} onChangeText={setName} />
        <AppInput placeholder="Email" value={email} onChangeText={setEmail} />
        <AppInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <AppButton title="Create Account" onPress={handleRegister} />
      </KeyboardWrapper>
    </ScreenWrapper>
  );
}
