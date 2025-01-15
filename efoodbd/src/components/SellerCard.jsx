// src/components/SellerCard.jsx
import React from "react";

const SellerCard = ({ seller }) => {
  return (
    <div className="bg-white shadow-lg  rounded-lg p-6 hover:shadow-xl transition-shadow">
      <h3 className="text-xl font-bold text-gray-800">{seller.name}</h3>
      <p className="text-gray-600">Location: {seller.location}</p>
      <p className="text-gray-600">Category: {seller.category}</p>
      <button className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        View Profile
      </button>
    </div>
  );
};

export default SellerCard;
