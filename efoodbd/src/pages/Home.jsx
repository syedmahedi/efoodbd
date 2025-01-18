import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import SellerCard from "../components/SellerCard";

const Home = () => {
  const [sellers, setSellers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/sellers"); // Fetch sellers from the backend
        if (!response.ok) {
          throw new Error("Failed to fetch sellers");
        }
        const data = await response.json();
        setSellers(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchSellers();
  }, []);

  return (
    <div className="bg-primary-content min-h-screen">
      <Header />
      <h1 className="text-center text-5xl mt-12 text-white">ঘরে ঘরে গড়ে তুলুন <span className="text-primary">আপনার ব্যবসা</span></h1>
      <div className="container mx-auto py-6">
        <SearchBar />
        <h2 className="text-2xl font-bold my-6 text-primary">Featured Sellers</h2>
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-base-content">
          {sellers.map((seller) => (
            <SellerCard key={seller.id} seller={seller} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
