import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiTool,
  FiTruck,
  FiDroplet,
  FiActivity,
  FiUser,
  FiClock,
} from "react-icons/fi";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE_URL;

const ServicesTab = ({ userId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, [userId]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/api/admin/support/customer/${userId}/services`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );
      setData(res.data.data);
    } catch (err) {
      toast.error("Failed to synchronize service history");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <FiActivity className="text-[#001F3F] animate-pulse" size={24} />
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Querying Service Infrastructure...
        </p>
      </div>
    );

  const renderTable = (title, services, icon) => (
    <div className="mb-12 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <div className="text-[#001F3F]">{icon}</div>
        <h3 className="text-[11px] font-bold text-black uppercase tracking-[0.2em]">
          {title}
        </h3>
        <span className="ml-auto text-[9px] font-black text-slate-300 uppercase tracking-widest">
          Node Count: {services?.length || 0}
        </span>
      </div>

      {services?.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            No active or historical records detected
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-[#CBD5E1] rounded-xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8FAFC] border-b border-[#CBD5E1]">
              <tr className="text-[11px] font-bold text-black uppercase tracking-widest">
                <th className="py-4 px-6">Service Status</th>
                <th className="px-6">Assigned Personnel</th>
                <th className="px-6 text-right text-black">
                  Initialization Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services?.map((service) => (
                <tr
                  key={service.id}
                  className="hover:bg-[#F8FAFC] transition-colors group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-[11px] font-bold text-[#001F3F] uppercase tracking-tight">
                        {service.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <FiUser size={12} />
                      <span className="text-[11px] font-medium uppercase tracking-tight">
                        {service.assignedMechanic || "UNASSIGNED"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <FiClock size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">
                        {new Date(service.createdAt).toDateString()}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {renderTable("Car Service Nodes", data?.carServices, <FiTruck />)}
      {renderTable("Bike Service Nodes", data?.bikeServices, <FiTool />)}
      {renderTable("Wash Service Nodes", data?.washServices, <FiDroplet />)}
    </div>
  );
};

export default ServicesTab;
