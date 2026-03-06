import { useEffect, useState } from "react";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import AppHeader from "../../components/ui/AppHeader";
import BookingCard from "./BookingCard";
import bookingsService from "./bookings.service";

export default function BookingsScreen() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const data = await bookingsService.fetchBookings();
    setBookings(data);
  };

  return (
    <ScreenWrapper>
      <AppHeader title="My Bookings" />
      {bookings.map((item) => (
        <BookingCard key={item.id} booking={item} />
      ))}
    </ScreenWrapper>
  );
}
