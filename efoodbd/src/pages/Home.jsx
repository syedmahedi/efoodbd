import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import SellerCard from "../components/SellerCard";
import Footer from "../components/Footer";

const Home = () => {
  const [sellers, setSellers] = useState([]); // Sellers to display
  const [error, setError] = useState(""); // Error handling

  const location = localStorage.getItem("location"); // Get location from local storage

  // Fetch sellers based on location (initial load)
  const fetchSellersByLocation = async () => {
    if (!location) {
      setError("Location not found in local storage.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/sellers/searchbylocation?location=${location}`);
      if (!response.ok) throw new Error("Failed to fetch sellers");

      const data = await response.json();
      setSellers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch sellers based on category
  const fetchSellersByCategory = async (category, location) => {
    if (!location) {
      setError("Location not found in local storage.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/sellers/searchbylocation?category=${category}&location=${location}`
      );
      if (!response.ok) throw new Error("Failed to fetch sellers");
  
      const data = await response.json();
      
      // If no sellers are found, set an empty array
      if (data.length === 0) {
        setSellers([]); 
        setError("No sellers found for this category.");
      } else {
        setSellers(data);
        setError(""); // Clear error if sellers are found
      }
    } catch (err) {
      setSellers([]); // Ensure old data is cleared on error
      setError(err.message);
    }
  };
  
  

  // Load sellers based on location on page load
  useEffect(() => {
    fetchSellersByLocation();
  }, []);


  return (
    <div className="bg-primary-content min-h-screen">
      <Header />
      <div className="flex flex-col-reverse lg:flex-row items-center justify-center lg:gap-0 px-6 lg:px-24 pt-3 sm:pt-0">
        {/* Left Content */}
        <div className="container mx-auto text-center lg:text-center">
          <h1 className="text-3xl mt-4 sm:text-5xl text-white font-bangla leading-relaxed">
            নিজের এলাকায় গড়ে তুলুন{" "}
            <p className="text-primary sm:leading-relaxed">আপনার ব্যবসা</p>
          </h1>
          <p className="text-md sm:text-lg font-light font-bangla mb-4">
            আপনার ঘরের তৈরি খাবার পৌঁছে দিন সবার কাছে !
          </p>
          {/* Search Bar */}
          <SearchBar onSearch={fetchSellersByCategory} />
        </div>

        {/* Right Image */}
        <div className="flex justify-center lg:justify-center w-full lg:w-3/4">
          <img src="home.png" alt="Home" className="w-full max-w-80 lg:max-w-sm h-auto" />
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-0">
        <h2 className="text-2xl font-bold my-4 lg:mb-4 lg:my-0 text-primary">
          Sellers in {location ? location.charAt(0).toUpperCase() + location.slice(1) : "your area"}
        </h2>
        {/* Seller Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-base-content">
          {sellers.length > 0 ? (
            sellers.map((seller) => (
              <SellerCard key={seller.seller_id} seller={seller} />
            ))
          ) : (           
            <p className="text-center col-span-3 text-gray-500"><span className="loading loading-spinner loading-md"></span>
            <p className="text-center text-gray-500">No sellers found</p>
            </p>
          )}
        </div>       
      </div>

      <Footer />
    </div>
  );
};

export default Home;
