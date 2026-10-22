// app.config.js
//
// Extends app.json with values that come from the environment, so secrets
// stay out of git. Expo reads app.json first and passes it in as `config`.
//
// GOOGLE_MAPS_API_KEY
//   Android's map (react-native-maps) always uses the Google Maps SDK and
//   CRASHES THE WHOLE APP natively in release builds when no key is set.
//   Set it as an EAS environment variable (or in a local .env for
//   `npx expo run:android`):
//     eas env:create --name GOOGLE_MAPS_API_KEY --value <key> --environment production --visibility sensitive
//   Without it the app still works: the SOS screen shows a location card
//   with "Open in Maps" instead of the embedded map.
module.exports = ({ config }) => {
  const mapsKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    config.android?.config?.googleMaps?.apiKey ||
    null;

  return {
    ...config,
    android: {
      ...config.android,
      ...(mapsKey && {
        config: {
          ...config.android?.config,
          googleMaps: { apiKey: mapsKey },
        },
      }),
    },
    extra: {
      ...config.extra,
      // android.config is stripped from the runtime config, so expose a
      // flag the app can check before rendering a map on Android.
      googleMapsEnabled: Boolean(mapsKey),
    },
  };
};
