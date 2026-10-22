// src/utils/navigation.js
// router.back() is a silent no-op when there is no history (deep link, cold
// start, or after router.replace()). On iOS that left users with a back
// button that did nothing. Always go back through this helper.
export function safeBack(router, fallback = "/(tabs)/home") {
  if (router?.canGoBack?.()) router.back();
  else router.replace(fallback);
}
