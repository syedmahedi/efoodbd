import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import SellerCard from "../components/SellerCard";
import ComplaintModal from "../components/ComplaintModal";
import Footer from "../components/Footer";


const Home = () => {
  const [sellers, setSellers] = useState([]);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/sellers");
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

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <div className="bg-primary-content min-h-screen">
      <Header />
      <div className="container mx-auto text-center px-4">
        <h1 className="text-3xl sm:text-5xl mt-16 text-white font-bangla">
          নিজের এলাকায় গড়ে তুলুন <span className="text-primary">আপনার ব্যবসা</span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl font-light font-bangla">আপনার ঘরের বানানো খাবার পৌঁছে দিন সবার কাছে!</p>
      </div>

      <div className="container mx-auto py-6">
        <SearchBar />
        <h2 className="text-2xl font-bold my-6 text-primary">Best Sellers</h2>
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-base-content">
          {sellers
            .sort((a, b) => b.id - a.id) // Sort by `id` descending
            .slice(0, 3) // Take the first 9 sellers
            .map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
        </div>
        {/* Complain Box Section */}
        <div className="mt-12 text-center">
          <button
            onClick={toggleModal}
            className="flex items-center justify-center mx-auto px-6 py-3 text-white bg-red-600 hover:bg-red-800 rounded-lg font-medium"
          >
            <img src="/paper.png" 
              alt="complain box"
              className="h-6 w-6 mr-2"
            />
            Complain Box
          </button>
        </div>
      </div>
      {/* Modal */}
      {isModalOpen && <ComplaintModal onClose={toggleModal} />}
      <Footer />
    </div>
  );
};

export default Home;
