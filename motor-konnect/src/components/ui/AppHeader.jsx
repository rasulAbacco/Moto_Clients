import ScreenHeader from "../common/ScreenHeader";
// Title header used inside <ScreenWrapper> (Login, Register, Garage details,
// Payments, Bookings). Now includes a proper platform back button —
// ScreenWrapper already applies the top safe-area inset.

export default function AppHeader({ title, showBack = true, right }) {
  return (
    <ScreenHeader
      title={title}
      showBack={showBack}
      right={right}
      safeArea={false}
      transparent
      border={false}
      style={{ marginHorizontal: -14, marginBottom: 12 }}
    />
  );
}
