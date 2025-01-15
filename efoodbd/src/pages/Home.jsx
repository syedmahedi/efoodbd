// src/pages/Home.jsx
import React from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import SellerCard from "../components/SellerCard";

const Home = () => {
  const sellers = [
    { id: 1, name: "Cake Maker", location: "Dhaka", category: "Cakes" },
    { id: 2, name: "Snacks Master", location: "Chittagong", category: "Snacks" },
    { id: 3, name: "Bread Baker", location: "Sylhet", category: "Bread" },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="container mx-auto py-6">
        <SearchBar />
        <h2 className="text-2xl font-bold my-6 text-gray-800">Featured Sellers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sellers.map((seller) => (
            <SellerCard key={seller.id} seller={seller} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
