import React from "react";
import { Link } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiBriefcase,
  FiGift,
} from "react-icons/fi";

const UserRegister = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Create Your Account
          </h2>
          <p className="text-gray-500 mt-2">
            Start managing your garage business today
          </p>
        </div>

        {/* Form */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <div className="flex items-center border rounded-lg mt-2 px-3">
              <FiUser className="text-gray-400" />
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="text-sm font-medium">Company Name</label>
            <div className="flex items-center border rounded-lg mt-2 px-3">
              <FiBriefcase className="text-gray-400" />
              <input
                type="text"
                placeholder="Garage name"
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <div className="flex items-center border rounded-lg mt-2 px-3">
              <FiMail className="text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium">Phone</label>
            <div className="flex items-center border rounded-lg mt-2 px-3">
              <FiPhone className="text-gray-400" />
              <input
                type="text"
                placeholder="Enter phone number"
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="flex items-center border rounded-lg mt-2 px-3">
              <FiLock className="text-gray-400" />
              <input
                type="password"
                placeholder="Create password"
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <div className="flex items-center border rounded-lg mt-2 px-3">
              <FiLock className="text-gray-400" />
              <input
                type="password"
                placeholder="Confirm password"
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          {/* Referral Code (Optional) */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">
              Referral Code (Optional)
            </label>
            <div className="flex items-center border rounded-lg mt-2 px-3">
              <FiGift className="text-gray-400" />
              <input
                type="text"
                placeholder="Enter referral code"
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          {/* Terms */}
          <div className="md:col-span-2 flex items-center space-x-2 text-sm">
            <input type="checkbox" />
            <span>
              I agree to the{" "}
              <span className="text-blue-600 hover:underline cursor-pointer">
                Terms & Conditions
              </span>
            </span>
          </div>

          {/* Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Create Account
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
