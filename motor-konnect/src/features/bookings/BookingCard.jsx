import AppCard from "../../components/ui/AppCard";
import AppText from "../../components/ui/AppText";

export default function BookingCard({ booking }) {
  return (
    <AppCard>
      <AppText variant="subtitle">{booking.garageName}</AppText>
      <AppText>{booking.date}</AppText>
      <AppText>Status: {booking.status}</AppText>
    </AppCard>
  );
}
