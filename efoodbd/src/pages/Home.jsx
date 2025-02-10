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

  // Fetch sellers based on food category (or all by default)
  const fetchSellers = async (category = "") => {
    try {
      const response = await fetch(`http://localhost:5000/api/sellers/search?category=${category}`);

      if (!response.ok) {
        throw new Error("Failed to fetch sellers");
      }

      const data = await response.json();
      setSellers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Load all sellers on page load
  useEffect(() => {
    fetchSellers();
  }, []);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

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
      <div className="container mx-auto py-6">
        <SearchBar onSearch={fetchSellers} />
        <h2 className="text-2xl font-bold my-6 text-primary">Best Sellers</h2>
        {error && <p className="text-red-500">{error}</p>}
        {sellers.length === 0 && !error && <p className="text-gray-500 text-center"><span className="loading loading-spinner loading-md"></span></p>}
        
        {/* Seller Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-base-content">
          {sellers.length > 0 ? (
            // Show 6 sellers when not searching, all when searching
            sellers
              .sort((a, b) => b.id - a.id) // Sort by latest first
              .slice(0, 6) // Conditional slice
              .map((seller) => (
                <SellerCard key={seller.seller_id} seller={seller} />
              ))
          ) : (
            <p className="text-center text-gray-500 col-span-3">No sellers found</p>
          )}
        </div>

        {/* Complaint Box */}
        <div className="mt-12 text-center">
          <button
            onClick={toggleModal}
            className="flex items-center justify-center mx-auto px-6 py-3 text-white bg-red-600 hover:bg-red-800 rounded-lg font-medium"
          >
            <img src="/paper.png" alt="complain box" className="h-6 w-6 mr-2" />
            Complain Box
          </button>
        </div>
      </div>

      {/* Complaint Modal */}
      {isModalOpen && <ComplaintModal onClose={toggleModal} />}
      <Footer />
    </div>
  );
};

export default Home;
