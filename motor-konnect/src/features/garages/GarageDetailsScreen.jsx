import { useEffect, useState } from "react";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import AppHeader from "../../components/ui/AppHeader";
import ServiceList from "./ServiceList";
import garagesService from "./garages.service";

export default function GarageDetailsScreen({ garageId }) {
  const [garage, setGarage] = useState(null);

  useEffect(() => {
    loadGarage();
  }, []);

  const loadGarage = async () => {
    const data = await garagesService.fetchGarageDetails(garageId);
    setGarage(data);
  };

  if (!garage) return null;

  return (
    <ScreenWrapper>
      <AppHeader title={garage.name} />
      <ServiceList services={garage.services} />
    </ScreenWrapper>
  );
}
