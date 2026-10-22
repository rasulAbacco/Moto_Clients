// Search lives on the Home tab (sticky search bar + live results).
// Any link to /search lands there instead of an empty placeholder page.
import { Redirect } from "expo-router";

export default function Search() {
  return <Redirect href="/(tabs)/home" />;
}
