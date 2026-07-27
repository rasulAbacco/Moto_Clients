import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import AppHeader from "../../components/ui/AppHeader";
import BookingCard from "./BookingCard";
import bookingsService from "./bookings.service";
import { useAuth } from "../../providers/AuthProvider";
import {
  connectSocket,
  subscribeToBookingUpdates,
} from "../../services/socket.service";

export default function BookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  const loadBookings = useCallback(async () => {
    if (!user?.phone) return;
    const data = await bookingsService.fetchBookings(user.phone);
    setBookings(data);
  }, [user?.phone]);

  // Refetch every time this screen comes into focus (e.g. after a booking
  // was accepted/rejected while the user was on another tab).
  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings]),
  );

  // Live updates: connect + subscribe once we know the phone number, and
  // patch the affected booking in place the moment the server pushes a
  // status change — no need to wait for the next screen focus.
  useEffect(() => {
    if (!user?.phone) return;

    connectSocket(user.phone);

    const unsubscribe = subscribeToBookingUpdates((payload) => {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === String(payload.id)
            ? {
                ...b,
                status: payload.status,
                serviceName: payload.serviceName ?? b.serviceName,
                finalPrice: payload.finalPrice ?? b.finalPrice,
                garageName: payload.garageName ?? b.garageName,
              }
            : b,
        ),
      );
    });

    return unsubscribe;
  }, [user?.phone]);

  return (
    <ScreenWrapper>
      <AppHeader title="My Bookings" />
      {bookings.map((item) => (
        <BookingCard key={item.id} booking={item} />
      ))}
    </ScreenWrapper>
  );
}
