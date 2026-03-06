// import api from "../../services/apiClient";
// import { ENDPOINTS } from "../../services/endpoints";

// const fetchBookings = async () => {
//   const { data } = await api.get(ENDPOINTS.BOOKINGS.LIST);
//   return data;
// };

// export default {
//   fetchBookings,
// };

const fetchBookings = async () => {
  return [
    {
      id: "1",
      garageName: "AutoFix Garage",
      date: "2026-03-01",
      status: "CONFIRMED",
    },
    {
      id: "2",
      garageName: "Speed Motors",
      date: "2026-03-05",
      status: "PENDING",
    },
  ];
};

export default { fetchBookings };