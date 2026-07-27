// bookings.service.js
import api from "../../services/apiClient";
import { ENDPOINTS } from "../../services/endpoints";

/**
 * Fetches the logged-in customer's real bookings from Motor Desk.
 * Requires the user's phone number (same value used everywhere else in
 * the app, e.g. client-lookup, notifications poll).
 *
 * Maps the server's field names onto what BookingCard.jsx already
 * expects (garageName, date, status) so no other file needs to change.
 */
const fetchBookings = async (phone) => {
  if (!phone) {
    console.warn("[bookings.service] fetchBookings called without a phone");
    return [];
  }

  try {
    const { data } = await api.get(ENDPOINTS.MARKETPLACE.MY_BOOKINGS, {
      params: { phone },
    });

    if (!data?.success) return [];

    return (data.data || []).map((b) => ({
      id: String(b.id),
      garageName: b.garageName,
      garageAddress: b.garageAddress,
      garagePhone: b.garagePhone,
      date: b.scheduledAt ? new Date(b.scheduledAt).toLocaleDateString() : "",
      status: b.status,
      serviceName: b.serviceName,
      finalPrice: b.finalPrice,
      carType: b.carType,

      // Full details, in case BookingCard (or a future detail screen) wants them
      notes: b.notes,
      pickupRequired: b.pickupRequired,
      pickupAddress: b.pickupAddress,
      dropAddress: b.dropAddress,
      vehicleMake: b.vehicleMake,
      vehicleModel: b.vehicleModel,
      vehicleRegNumber: b.vehicleRegNumber,
      packageName: b.packageName,
      services: b.services,
    }));
  } catch (err) {
    console.error(
      "[bookings.service] fetchBookings failed:",
      err?.response?.data?.message || err.message,
    );
    return [];
  }
};

export default { fetchBookings };
