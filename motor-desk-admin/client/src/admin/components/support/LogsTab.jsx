import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiActivity } from "react-icons/fi";

const API = import.meta.env.VITE_API_BASE_URL;

const LogsTab = ({ userId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [userId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/api/admin/support/customer/${userId}/logs`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );

      setLogs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="text-sm text-gray-400">Loading logs...</div>;

  if (!logs.length)
    return <p className="text-sm text-gray-400">No support logs found.</p>;

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div
          key={log.id}
          className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase tracking-widest text-blue-600 font-bold">
              {log.action}
            </span>

            <span className="text-xs text-gray-400">
              {new Date(log.createdAt).toDateString()}
            </span>
          </div>

          {log.meta && (
            <pre className="text-xs bg-gray-50 p-3 rounded-lg text-gray-600 overflow-x-auto">
              {JSON.stringify(log.meta, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
};

export default LogsTab;
