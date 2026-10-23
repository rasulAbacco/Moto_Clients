// server/src/controllers/chat.controller.js
//
// Motor Konnect support chatbot.
// The Gemini API key lives ONLY here (server .env → GEMINI_API_KEY). It used
// to be inside the app, where anyone can read it — Google then blocks the key
// as "leaked". The app now sends messages to POST /api/chat.
//
// If Gemini is not configured or fails, the bot still answers common
// questions from the built-in FAQ below, so the chat never shows an error.

const SUPPORT_PHONE = process.env.SUPPORT_PHONE || "+91 77956 92753";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@motorkonnect.com";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

// ── Everything the bot knows about the app ─────────────────────────────────
export const SYSTEM_PROMPT = `
You are the friendly AI Support Assistant for Motor Konnect (the app) and its Motor Store.
Only help with Motor Konnect, cars, bikes, servicing and spare parts. Politely decline unrelated topics.

ABOUT MOTOR KONNECT
- An app for car and bike owners in India: book garage services, get SOS roadside help and buy spare parts.
- Tabs at the bottom: Home, Store, SOS, Support, Account.

SERVICES (Home tab)
- Car and bike services: scheduled service packages, general service, engine work, AC service, detailing/cleaning, washing, repairs.
- To book: pick your vehicle → choose a service or package → choose a garage → confirm.
- Garages are suggested based on the user's live location (allow location access).
- Pricing: each garage owner sets their own prices, so prices vary from garage to garage.
- Past bookings: Account → Service history / My bookings.

SOS (SOS tab — red)
- Emergency roadside help: puncture, towing, battery jump-start, fuel delivery, breakdown, accident help, key lock-out.
- Steps: open SOS → turn on location/GPS → choose the problem → confirm or call.
- The map shows your live location. If the map does not load, use "Open in Maps" or call the SOS number.
- In a real emergency or accident, also call 112.

MOTOR STORE (Store tab) — spare parts
- Genuine spare parts for cars and bikes from local partner shops. Switch "Car parts / Bike parts" at the top; search by name, brand or part number; filter by category.
- Tap "Add" on a part (or open it and tap Add to cart / Buy now). Use − and + to change quantity.
- "View cart" bar at the bottom → cart → checkout. You can change quantity or remove items in checkout.
- Each shop's items become a separate order.
- Delivery or pickup: if the shop delivers, choose home delivery (a delivery charge may apply); otherwise choose "Pick up from shop".
- Payment: Cash on delivery (COD), Pay at shop (for pickup), or UPI. For UPI, pay to the shop's UPI ID shown, then enter the 12-digit UTR / transaction reference so the shop can verify.
- Track orders in My parts orders: Placed → Accepted → Packed → Shipped → Delivered (pickup orders: Ready for pickup → Picked up). Orders can be cancelled before they are packed.
- Prices include GST.

ACCOUNT & LOGIN
- Log in with your mobile number and a 6-digit OTP sent by SMS (email is optional). The OTP is valid for 10 minutes; tap "Resend OTP" if it expired or didn't arrive.
- You stay logged in until you tap Log out.
- Edit profile: Account → Profile → Edit — change name, email, date of birth, address and profile photo.
- Vehicles: Account → My vehicles — add a vehicle (+), set one as primary, or remove one. Add vehicles from Profile too.

PAYMENTS & REFUNDS
- Refunds, if approved, are processed within 5–7 business days.
- To cancel a service booking: My bookings → select the booking → Cancel.

CONTACT SUPPORT
- Phone / WhatsApp: ${SUPPORT_PHONE}
- Email: ${SUPPORT_EMAIL}
- Or open the Support tab in the app.

HOW TO ANSWER
- Understand typos (servis → service, puncher → puncture, brek → brake).
- Be short and clear: 1–4 sentences or a few short steps.
- Use **bold** for button and screen names. No other markdown (no headings, no tables).
- Never make up prices, garage names, order details or phone numbers. If you don't know, say so and share the support contact.
- Reply in the user's language (English, Hindi, Kannada, etc.).
`.trim();

// ── Built-in answers (used when the AI is unavailable) ─────────────────────
const FAQ = [
  {
    match:
      /sos|emergen|puncture|puncher|tow|jump|battery|breakdown|accident|stuck|fuel/i,
    answer: `For emergency help open the **SOS** tab, turn on location, choose your problem (puncture, towing, jump-start, fuel, breakdown) and confirm or tap call. You can also call us on **${SUPPORT_PHONE}**. In an accident, call **112** first.`,
  },
  {
    match: /price|cost|charge|rate|expensive|cheap/i,
    answer:
      "Each garage sets its own prices, so they can differ between garages. You'll see the exact price before you confirm a booking. Spare parts prices in the **Store** include GST.",
  },
  {
    match: /book|servic|servis|garage|wash|detail|ac\b|engine|repair|package/i,
    answer:
      "To book a service: on **Home**, pick your vehicle → choose a service or package → select a garage near you → **Confirm**. Garages are shown based on your location, so please allow location access.",
  },
  {
    match: /cod|cash|upi|utr|pay|payment/i,
    answer:
      "In the **Store** you can pay **Cash on delivery**, **Pay at shop** (for pickup) or **UPI**. For UPI, pay to the shop's UPI ID shown at checkout, then enter the 12-digit **UTR** so the shop can verify your payment.",
  },
  {
    match:
      /deliver|pickup|pick up|track|order|cancel.*(order|part)|where.*(order|parts)/i,
    answer:
      "Track spare parts orders in **My parts orders**: Placed → Accepted → Packed → Shipped → Delivered (or Ready for pickup). Shops that deliver offer home delivery; otherwise choose **Pick up from shop**. You can cancel an order before it's packed.",
  },
  {
    match: /store|spare|part|buy|cart|brake|oil|filter|tyre|tire|chain|clutch/i,
    answer:
      "Open the **Store** tab, choose **Car parts** or **Bike parts**, search or pick a category, and tap **Add**. Then tap **View cart** at the bottom → **Checkout**. You can change quantities or remove items there.",
  },
  {
    match: /refund|money back/i,
    answer:
      "Approved refunds are processed within **5–7 business days**. If it's taking longer, contact support with your order details.",
  },
  {
    match: /cancel/i,
    answer:
      "To cancel a service booking go to **My bookings** → select the booking → **Cancel**. Spare parts orders can be cancelled in **My parts orders** before they are packed.",
  },
  {
    match: /otp|login|log in|sign|verify|code/i,
    answer:
      "Log in with your mobile number and the 6-digit OTP sent by SMS. The OTP is valid for 10 minutes — if it expired or didn't arrive, tap **Resend OTP**. You stay logged in until you tap **Log out**.",
  },
  {
    match: /profile|name|email|photo|picture|address|dob|birth/i,
    answer:
      "Go to **Account** → **Profile** → **Edit** to change your name, email, date of birth, address or profile photo, then tap **Save**.",
  },
  {
    match: /vehicle|car|bike|scooter|add.*(car|bike)|primary/i,
    answer:
      "Manage vehicles in **Account** → **My vehicles**: tap **+** to add one, set your main vehicle as **Primary**, or remove one you no longer use.",
  },
  {
    match: /contact|support|call|phone|email|help|human|agent|complain/i,
    answer: `You can reach Motor Konnect support on **${SUPPORT_PHONE}** (call or WhatsApp) or email **${SUPPORT_EMAIL}**. You can also use the **Support** tab.`,
  },
  {
    match: /^(hi|hii+|hello|hey|namaste|good (morning|afternoon|evening))\b/i,
    answer:
      "Hi! I can help with **service booking**, **SOS** roadside help, **spare parts** orders, payments and your account. What do you need?",
  },
];

const fallbackAnswer = (text) =>
  FAQ.find((f) => f.match.test(text || ""))?.answer ||
  `I can help with **service booking**, **SOS**, **spare parts**, payments and your account. For anything else, contact support on **${SUPPORT_PHONE}** or **${SUPPORT_EMAIL}**.`;

// ── Gemini call ────────────────────────────────────────────────────────────
const MAX_HISTORY = 12; // last messages sent for context
const MAX_LEN = 1000; // characters per message

async function askGemini(history, message) {
  const key = process.env.GEMINI_API_KEY;
  if (!key)
    throw Object.assign(new Error("GEMINI_API_KEY not set"), { quiet: true });

  const contents = [
    ...history.map((m) => ({
      role: m.role === "bot" || m.role === "model" ? "model" : "user",
      parts: [{ text: String(m.text || "").slice(0, MAX_LEN) }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key, // header, not in the URL (keeps it out of logs)
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
        }),
        signal: controller.signal,
      },
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.error) {
      throw new Error(
        `Gemini ${res.status}: ${json.error?.status || ""} ${json.error?.message || ""}`.trim(),
      );
    }
    const text = json?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim();
    if (!text) throw new Error("Gemini returned no text");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

// POST /api/chat   { message: "...", history: [{ role: "user"|"bot", text }] }
export const chat = async (req, res) => {
  const message = String(req.body?.message || "")
    .trim()
    .slice(0, MAX_LEN);
  if (!message) {
    return res
      .status(400)
      .json({ success: false, message: "Message is required" });
  }
  const history = Array.isArray(req.body?.history)
    ? req.body.history.filter((m) => m && m.text).slice(-MAX_HISTORY)
    : [];

  try {
    const reply = await askGemini(history, message);
    return res.json({ success: true, reply, source: "ai" });
  } catch (err) {
    if (!err.quiet) console.error("Chatbot AI error:", err.message);
    return res.json({
      success: true,
      reply: fallbackAnswer(message),
      source: "faq",
    });
  }
};
