import React from "react";
import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";

const PricingCard = ({ title, price, features = [], highlighted = false }) => {
  return (
    <div
      className={`relative rounded-2xl border p-8 transition duration-300
      ${
        highlighted
          ? "bg-blue-600 text-white shadow-xl scale-105"
          : "bg-white shadow-sm hover:shadow-md"
      }`}
    >
      {/* Popular Badge */}
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-blue-600 text-xs font-semibold px-4 py-1 rounded-full shadow">
          MOST POPULAR
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-semibold">{title}</h3>

      {/* Price */}
      <div className="mt-4">
        <span className="text-4xl font-bold">₹{price}</span>
        <span className="text-sm ml-2 opacity-70">/month</span>
      </div>

      {/* Features */}
      <ul className="mt-6 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2">
            <FiCheck
              className={highlighted ? "text-white" : "text-green-500"}
            />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        to="/register"
        className={`block mt-8 text-center py-3 rounded-lg font-medium transition
        ${
          highlighted
            ? "bg-white text-blue-600 hover:bg-gray-100"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        Get Started
      </Link>
    </div>
  );
};

export default PricingCard;
