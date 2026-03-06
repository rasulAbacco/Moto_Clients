// import api from "../../services/apiClient";
// import { ENDPOINTS } from "../../services/endpoints";

// const fetchGarageDetails = async (id) => {
//   const { data } = await api.get(ENDPOINTS.GARAGES.DETAILS(id));
//   return data;
// };

// export default {
//   fetchGarageDetails,
// };

const fetchGarageDetails = async (id) => {
  return {
    id,
    name: "AutoFix Garage",
    services: [
      { id: "1", name: "Oil Change", price: 999 },
      { id: "2", name: "Full Service", price: 2999 },
    ],
  };
};

export default { fetchGarageDetails };
