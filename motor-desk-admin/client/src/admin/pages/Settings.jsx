import React from "react";
import { FiSave } from "react-icons/fi";

const Settings = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">
          Referral Settings
        </h2>
        <p className="text-sm text-gray-500">
          Configure commission percentages and payout rules
        </p>
      </div>

      {/* Settings Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Commission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Commission (%)
            </label>
            <input
              type="number"
              placeholder="e.g. 10"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Percentage of subscription amount given to users
            </p>
          </div>

          {/* Partner Commission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partner Commission (%)
            </label>
            <input
              type="number"
              placeholder="e.g. 20"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Percentage of subscription amount given to partners
            </p>
          </div>

          {/* Reward After Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reward After (Days)
            </label>
            <input
              type="number"
              placeholder="e.g. 7"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Commission becomes eligible after these days
            </p>
          </div>

          {/* Minimum Payout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Payout Amount (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 2000"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Minimum balance required before payout
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
            <FiSave />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
