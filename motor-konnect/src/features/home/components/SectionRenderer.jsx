import PromoCarousel from "./PromoCarousel";
import MembershipCards from "./MembershipCards";
import CuratedServices from "./CuratedServices";
import AssistBanner from "./AssistBanner";
import VehicleSelector from "./VehicleSelector";
import GarageList from "./GarageList";

export default function SectionRenderer({ section }) {
  switch (section.type) {
    case "carousel":
      return <PromoCarousel banners={section.data} />;

    // case "vehicleSelector":
    //   return (
    //     <VehicleSelector
    //       selected={section.selected}
    //       onChange={section.onChange}
    //     />
    //   );

    case "garages":
      return <GarageList garages={section.data} loading={section.loading} />;

    case "membership":
      return <MembershipCards />;

    case "curated":
      return <CuratedServices data={section.data} />;

    case "assist":
      return <AssistBanner />;

    default:
      return null;
  }
}
