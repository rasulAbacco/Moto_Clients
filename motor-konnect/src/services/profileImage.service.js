// Profile photo: load and upload.
// Upload uses fetch + FormData without setting Content-Type by hand — iOS
// then adds the multipart boundary itself (setting it manually is what broke
// uploads on iPhone).
import api, { API_URL } from "./apiClient";
import { getToken } from "./storage.service";

/** Current photo as a data URL, or null if the user has none */
export const fetchProfileImage = async () => {
  const { data } = await api.get("/auth/profile-image", {
    params: { as: "json" },
  });
  return data?.dataUrl || null;
};

const guessType = (asset) => {
  if (asset?.mimeType?.startsWith("image/")) return asset.mimeType;
  const ext = String(asset?.fileName || asset?.uri || "")
    .split("?")[0]
    .split(".")
    .pop()
    ?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic" || ext === "heif") return "image/heic";
  return "image/jpeg";
};

/**
 * Upload a photo picked with expo-image-picker (pass the asset).
 * Returns the new photo as a data URL. Throws Error(message) on failure.
 */
export const uploadProfileImage = async (asset) => {
  const type = guessType(asset);
  const ext = type.split("/")[1] === "jpeg" ? "jpg" : type.split("/")[1];

  const form = new FormData();
  form.append("image", {
    uri: asset.uri,
    name: asset.fileName || `profile.${ext}`,
    type,
  });

  const token = await getToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);

  let res;
  try {
    res = await fetch(`${API_URL}/auth/profile-image`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: form,
      signal: controller.signal,
    });
  } catch (e) {
    throw new Error(
      e?.name === "AbortError"
        ? "Upload took too long. Please try again on a better connection."
        : "Couldn't reach the server. Check your internet connection.",
    );
  } finally {
    clearTimeout(timer);
  }

  let body = null;
  try {
    body = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(
      body?.message ||
        (res.status === 413
          ? "Photo is too large. Please choose a smaller one."
          : `Upload failed (error ${res.status}).`),
    );
  }
  return body?.dataUrl || asset.uri;
};
