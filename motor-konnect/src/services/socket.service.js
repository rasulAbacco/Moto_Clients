// socket.service.js
//
// Client-side real-time connection to Motor Desk (the CRM server).
// Mirrors the pattern already used by the CRM's own garage-side socket:
// we connect once, join a room keyed by the user's phone number, and the
// server pushes a "booking_status_updated" event to that room whenever a
// garage owner accepts/rejects/updates one of this customer's bookings.
//
// Requires: `npm install socket.io-client` in motor-konnect.

import { io } from "socket.io-client";
import { getSocketBaseURL } from "./apiClient";

let socket = null;
let joinedPhone = null;

// Listeners registered by screens via subscribe(). Kept here (rather than
// only on the socket instance) so screens can subscribe/unsubscribe freely
// without worrying about the connection's lifecycle.
const statusListeners = new Set();

/**
 * Connects the socket (idempotent — safe to call multiple times) and
 * joins the customer's room so the server can push updates to them.
 * Call this once the user's phone number is known (e.g. after login).
 */
export const connectSocket = (phone) => {
  if (!phone) {
    console.warn("[socket.service] connectSocket called without a phone");
    return;
  }

  if (!socket) {
    socket = io(getSocketBaseURL(), {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });

    socket.on("connect", () => {
      console.log("🔥 [socket.service] connected:", socket.id);
      // (Re)join on every (re)connect — sockets don't remember rooms across reconnects.
      if (joinedPhone) {
        socket.emit("join_client", joinedPhone);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️ [socket.service] disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.log("❌ [socket.service] connect_error:", err.message);
    });

    socket.on("booking_status_updated", (payload) => {
      console.log("📦 [socket.service] booking_status_updated:", payload);
      statusListeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (e) {
          console.error("[socket.service] listener error:", e.message);
        }
      });
    });
  }

  joinedPhone = phone;

  if (socket.connected) {
    socket.emit("join_client", phone);
  }
  // If not yet connected, the "connect" handler above will join once it is.
};

/**
 * Subscribe to real-time booking status updates.
 * Returns an unsubscribe function — call it in a useEffect cleanup.
 *
 * Example:
 *   useEffect(() => {
 *     return subscribeToBookingUpdates((payload) => {
 *       // payload: { id, status, serviceName, scheduledAt, finalPrice, garageName }
 *     });
 *   }, []);
 */
export const subscribeToBookingUpdates = (listener) => {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
};

/**
 * Disconnects the socket entirely. Call on logout.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  joinedPhone = null;
  statusListeners.clear();
};

export default {
  connectSocket,
  subscribeToBookingUpdates,
  disconnectSocket,
};
