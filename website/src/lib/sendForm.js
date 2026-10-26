/**
 * Sends a form to Web3Forms, which emails it to the inbox linked to the access key.
 *
 * IMPORTANT: Web3Forms delivers to the email address the access key was created
 * with. Make sure this key belongs to support@motorkonnect.com (check at
 * https://web3forms.com → dashboard). This key is public by design — it can
 * only send email to that one inbox.
 */
export const WEB3FORMS_KEY = "24f2770f-dc2e-404e-b899-0c75eee70256";

/**
 * @param {Record<string, string>} fields  Form fields — become rows in the email.
 * @param {{ subject: string, fromName?: string, replyTo?: string }} meta
 * @returns {Promise<{ ok: boolean, message: string }>}
 */
export async function sendForm(
  fields,
  { subject, fromName = "Motor Konnect Website", replyTo } = {},
) {
  // Honeypot: real people never fill the hidden "botcheck" field.
  if (fields.botcheck) return { ok: true, message: "ok" };
  const { botcheck, ...clean } = fields;

  const payload = {
    access_key: WEB3FORMS_KEY,
    subject,
    from_name: fromName,
    ...(replyTo ? { replyto: replyTo } : {}),
    ...clean,
    "Submitted from": window.location.href,
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success)
      return { ok: true, message: data.message || "Sent" };
    return {
      ok: false,
      message: data.message || `Request failed (${res.status})`,
    };
  } catch (err) {
    return {
      ok: false,
      message:
        err.name === "AbortError"
          ? "The request timed out."
          : "Network error — please check your connection.",
    };
  }
}
