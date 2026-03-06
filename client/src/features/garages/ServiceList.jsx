import AppCard from "../../components/ui/AppCard";
import AppText from "../../components/ui/AppText";

export default function ServiceList({ services }) {
  return services.map((service) => (
    <AppCard key={service.id}>
      <AppText variant="subtitle">{service.name}</AppText>
      <AppText>₹ {service.price}</AppText>
    </AppCard>
  ));
}
