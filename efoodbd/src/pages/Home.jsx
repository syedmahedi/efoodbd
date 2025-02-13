import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import SellerCard from "../components/SellerCard";
import ComplaintModal from "../components/ComplaintModal";
import Footer from "../components/Footer";

const Home = () => {
  const [sellers, setSellers] = useState([]); // Sellers to display
  const [error, setError] = useState(""); // Error handling
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleOpenModal = () => {
    setIsModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div className="bg-primary-content min-h-screen">
      <Header />
      <div className="container mx-auto text-center px-4">
        <h1 className="text-3xl mt-8 sm:text-5xl sm:mt-20 text-white font-bangla leading-relaxed">
          নিজের এলাকায় গড়ে তুলুন <span className="text-primary">আপনার ব্যবসা</span>
        </h1>
        <p className="mt-4 text-md sm:text-lg font-light font-bangla">
          আপনার ঘরের বানানো খাবার পৌঁছে দিন সবার কাছে !
        </p>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto py-4 px-6 sm:px-0">
        <SearchBar onSearch={fetchSellersByCategory} />
        <h2 className="text-2xl font-bold my-6 text-primary">
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
