import { useLocalSearchParams } from "expo-router";
import GarageDetailsScreen from "../../src/features/garages/GarageDetailsScreen";

export default function GarageDetails() {
  const { id } = useLocalSearchParams();
  return <GarageDetailsScreen garageId={id} />;
}
