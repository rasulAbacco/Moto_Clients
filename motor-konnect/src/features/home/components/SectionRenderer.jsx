// SectionRenderer.jsx
import PromoCarousel from "./PromoCarousel";
import MembershipCards from "./MembershipCards";
import CuratedServices from "./CuratedServices";
import AssistBanner from "./AssistBanner";
import VehicleSelector from "./VehicleSelector";
import GarageList from "./GarageList";
import ServiceCardList from "../../../components/ServiceCardList";
// ❌ UnifiedSearchResults.jsx is replaced by ServiceCardList — delete that
// file, nothing imports it anymore.
// Note: ServiceCategories.jsx also still exists in this folder but is not
// wired in — Home needs real garage-linked rows, not generic catalog
// categories with no garage attached.

export default function SectionRenderer({ section }) {
  switch (section.type) {
    case "carousel":
      return <PromoCarousel banners={section.data} />;

    case "vehicleSelector":
      return (
        <VehicleSelector
          selected={section.selected}
          onChange={section.onChange}
        />
      );

    case "garages":
      return <GarageList garages={section.data} loading={section.loading} />;

    case "curated":
      return <CuratedServices data={section.data} />;

    case "membership":
      return <MembershipCards />;

    case "assist":
      return <AssistBanner />;

    case "unifiedSearch":
      // Flat rows: each row = one service + its garage's metadata merged.
      // Used for search results, Home's default listing, and "More from
      // this garage" — title comes from whichever section HomeScreen
      // built (undefined = no title shown).
      return (
        <ServiceCardList
          rows={section.data}
          loading={section.loading}
          title={section.title}
        />
      );

    default:
      return null;
  }
}
