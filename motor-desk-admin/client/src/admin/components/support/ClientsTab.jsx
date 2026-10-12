import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiUsers } from "react-icons/fi";

const API = import.meta.env.VITE_API_BASE_URL;

const ClientsTab = ({ userId }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, [userId]);

  const fetchClients = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/api/admin/support/customer/${userId}/clients`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );

      setClients(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="text-sm text-gray-400">Loading clients...</div>;

  if (!clients.length)
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No clients found.
      </div>
    );

  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Phone</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="px-6 py-4 font-medium text-black">
                {client.fullName}
              </td>
              <td className="px-6 py-4 text-gray-600">{client.phone || "-"}</td>
              <td className="px-6 py-4 text-gray-600">{client.email || "-"}</td>
              <td className="px-6 py-4 text-gray-500 text-sm">
                {new Date(client.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientsTab;
