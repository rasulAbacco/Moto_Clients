import ScreenWrapper from "../../components/layout/ScreenWrapper";
import AppHeader from "../../components/ui/AppHeader";
import AppButton from "../../components/ui/AppButton";

export default function PaymentScreen() {
  return (
    <ScreenWrapper>
      <AppHeader title="Payment" />
      <AppButton title="Proceed to Pay" onPress={() => {}} />
    </ScreenWrapper>
  );
}
