import ScreenHeader from "./ScreenHeader";
// Kept for backward compatibility — delegates to the shared ScreenHeader.

export default function AppHeader(props) {
  return <ScreenHeader {...props} />;
}
