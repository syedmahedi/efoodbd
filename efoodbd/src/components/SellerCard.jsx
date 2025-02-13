import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

const SellerCard = ({ seller }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/seller/${seller.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-gray-900 p-4 rounded-lg cursor-pointer hover:shadow-md hover:shadow-gray-500 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{seller.name}</h3>
          <p>{seller.location}</p>
          {/* <p>{seller.foodCategory}</p> */}
        </div>
        <div className="w-24 h-24 rounded-full bg-gray-200 border-2 border-primary overflow-hidden hover:shadow-md hover:shadow-primary">
          <img
            src={seller.profilePicture ? `http://localhost:5000${seller.profilePicture}` : "/default-profile.png"}
            alt={seller.name}
            className="w-full h-full object-cover scale-100 hover:scale-110 ease-in duration-500"
          />
        </div>
      </div>     
    </div>
  );
};

export default SellerCard;
