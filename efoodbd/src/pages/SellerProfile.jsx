import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const SellerProfile = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/sellers/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch seller details");
        }
        const data = await response.json();
        setSeller(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchSeller();
  }, [id]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!seller) {
    return <p className="text-center mt-6">Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <div className="flex items-center space-x-6">
        {/* Profile Picture */}
        <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
          <img
            src={seller.profilePicture || "/default-profile.png"} // Replace with the seller's profile picture URL or a default image
            alt={`${seller.name}'s profile`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Seller Info */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{seller.name}</h2>
          <p className="text-gray-600 mt-1">
            <span className="font-semibold">Location:</span> {seller.location}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Category:</span> {seller.foodCategory}
          </p>
        </div>
      </div>

      {/* Seller Description */}
      <div className="mt-6">
        <h3 className="text-2xl font-semibold text-gray-800">About the Seller</h3>
        <p className="text-gray-700 mt-3 leading-relaxed">
          {seller.description ||
            "No description provided. This seller has not shared details about their business yet."}
        </p>
      </div>

      {/* Contact and Actions */}
      <div className="mt-6 flex space-x-4">
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          onClick={() => alert("Contact seller functionality is under development!")}
        >
          Contact Seller
        </button>
        <button
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          onClick={() => alert("Order items functionality is under development!")}
        >
          View Items
        </button>
      </div>
    </div>
  );
};

export default SellerProfile;
