import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import ComplaintModal from "../components/ComplaintModal";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Pagination,Autoplay } from "swiper/modules";

const SellerProfile = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // State for loading
  const [selectedPost, setSelectedPost] = useState(null); // For the selected food post
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [stats, setStats] = useState({ total_orders: 0, total_sales: 0 });
  const [reviews, setReviews] = useState([]);

  const [orderDetails, setOrderDetails] = useState({
    quantity: 1,
    contact: "",
  });

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

    const fetchStats = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/seller-stats/${id}`);
        if (!response.ok) throw new Error("Failed to fetch stats");

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      }
    };
    if (id) {
      fetchStats();
    }

    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/reviews/${id}`);
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/sellers/${id}/posts`);
        if (!response.ok) {
          throw new Error("Failed to fetch seller posts");
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchReviews();
    fetchSeller();
    fetchPosts();
  }, [id]);

  const handleOrderNow = (post) => {
    setSelectedPost(post);
    setOrderModalOpen(true); 
  };
  const calculateTotal = () => {
    return selectedPost.price * orderDetails.quantity;
  };

  const formatDate = (isoDate) => {
    const options = {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-BD", options).format(new Date(isoDate));
  };
  

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading
    const buyerEmail = localStorage.getItem("userEmail"); 
    const orderData = {
      buyerEmail,
      sellerId: id,
      postId: selectedPost.id,
      orderedItem: selectedPost.title, 
      quantity: orderDetails.quantity,
      contact: orderDetails.contact,
      price: calculateTotal(),
    };
  
    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
  
      if (!orderDetails.contact || orderDetails.quantity < 1 || !response.ok) {
        setMessage("Are you logged in? Provide valid information.");
        setMessageType("error");
        return;
      }
  
      // Send email to the seller
      const emailResponse = await fetch("http://localhost:5000/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerEmail: seller.email, // Ensure this data is available
          buyerEmail,
          sellerName: seller.name,
          orderedItem: selectedPost.title,
          quantity: orderDetails.quantity,
          price: calculateTotal(),
          contact: orderDetails.contact,
        }),
      });
      if (emailResponse.ok) {
        setMessage("Order placed successfully!");
        setMessageType("success");
      } else {
        setMessage("Check your internet connection!");
        setMessageType("error");
      }
  
      // Reset form & close modal
      setOrderModalOpen(false);
      setOrderDetails({ quantity: 1, contact: "" });
    } catch (err) {
      setMessage(`Error placing order: ${err.message}`);
      setMessageType("error");
    }
    finally {
      setLoading(false); // Reset loading
    }
    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 3000);
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!seller) {
    return <p className="text-center mt-6"><span className="loading loading-spinner loading-md"></span></p>;
  }

  return (
    <div className="bg-primary-content min-h-screen">
      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.p
            initial={{ y: -50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.5 }} 
            className={`fixed top-6 left-0 right-0 z-50  text-center ${
              messageType === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
      <Header />
      <div className="max-w-6xl mx-auto p-6 rounded-lg">
        {/* Seller Information */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-12 bg-primary-content p-6 rounded-lg shadow-md">
          {/* Profile Image */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gray-200 border-4 border-primary overflow-hidden flex-shrink-0">
            <img
              src={seller.profilePicture ? `http://localhost:5000${seller.profilePicture}` : "/default-profile.png"}
              className="w-full h-full object-cover scale-100 hover:scale-110 transition-transform duration-500"
              alt="Seller Profile"
            />
          </div>

          {/* Seller Info */}
          <div className="text-center lg:text-left mt-4 lg:mt-0 lg:ml-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary">{seller.name}</h2>
            <p className="mt-1 text-gray-500">
              <span className="font-semibold">📍Location:</span> {seller.location}
            </p>
            <p className="text-gray-500">
              <span className="font-semibold">🍽 Category:</span> {seller.foodCategory}
            </p>
            <p className="text-gray-500">
              <span className="font-semibold">🆔 Seller ID:</span> {seller.id}
            </p>
          </div>

          {/* Seller Stats */}
          <div className="grid grid-cols-2 gap-12  bg-primary-content p-4 rounded-lg w-full max-w-xs">
            <div className="text-center">
              <p className="stat-title text-gray-500 font-semibold">Total Orders</p>
              <p className="stat-value text-primary text-3xl font-bold">{stats.total_orders}</p>
            </div>
            <div className="text-center">
              <p className="stat-title text-gray-500 font-semibold">Total Sales</p>
              <p className="stat-value text-primary text-3xl font-bold">৳{stats.total_sales} BDT</p>
            </div>
          </div>
        </div>
        {/* review section */}
        <div className="flex items-center lg:justify-start justify-center mx-auto px-6">
          <ComplaintModal />
        </div>
        {/* Seller Reviews */}
        <div className="w-full max-w-lg mx-auto mt-4">
          <h2 className="text-xl font-bold text-center mb-4">Seller Reviews</h2>
          {reviews.length > 0 ? (
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={10}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            className="rounded-lg border border-gray-800 mt-3 shadow-lg"
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={index} className="p-4 bg-gray-900 text-white rounded-lg">
                <p className="text-lg font-semibold text-primary">{review.complainant}</p>
                <p className="text-sm text-gray-400">{review.description}</p>
                <div className="flex gap-1 mt-2 mb-2 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xl ${i < review.rating ? "text-yellow-400" : "text-gray-600"}`}>
                      ★
                    </span>
                  ))}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-center text-gray-500">No reviews yet.</p>
        )}
        </div>
        {/* About Seller */}
        <div className="mt-6">
          <h3 className="text-primary text-2xl font-semibol">About the Seller</h3>
          <p className=" mt-3 leading-relaxed">
            {seller.bio ||
              "This seller has not shared details about their business yet."}
          </p>
        </div>

        {/* Seller Posts */}
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-primary">Seller's Posts</h3>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
              {posts.map((post) => (
                <div
                key={post.id}
                className="relative shadow-sm shadow-gray-500 rounded-lg overflow-hidden group hover:shadow-md hover:shadow-gray-500 transition-all duration-300"
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={post.food_image ? `http://localhost:5000${post.food_image}` : "/default-food.jpg"}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:blur-sm"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-primary-content bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <p className="text-white text-2xl font-bold">৳{post.price} BDT</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="max-w-[70%]">
                      <h4 className="text-lg font-bold text-primary">{post.title}</h4>
                      <p className="text-sm mt-2 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                        {post.description.length > 25 ? (
                          <>
                            {post.description.substring(0, 100)}...
                            <button
                              className="text-primary hover:underline ml-1"
                              onClick={() => alert(post.description)}
                            >
                              See more
                            </button>
                          </>
                        ) : (
                          post.description
                        )}
                      </p>
                      <p className="text-sm mt-2">{formatDate(post.created_at)}</p>
                    </div>                  
                    <button
                      className="mt-4 px-4 py-2 bg-primary hover:bg-hover text-white rounded-lg font-semibold self-end"
                      onClick={() => handleOrderNow(post)}
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>              
              ))}
            </div>
          ) : (
            <p className="text-gray-600 mt-4">No posts available from this seller.</p>
          )}
        </div>
      </div>

      {/* Order Modal */}
      {orderModalOpen && (
        <div className="fixed inset-0 bg-primary-content bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-primary-content p-6 rounded-lg max-w-md w-full shadow-sm shadow-primary">
            <h2 className="text-lg text-center font-bold">Order: <span className="text-primary">{selectedPost.title}</span></h2>

            {/* Quantity Field */}
            <label className="block mb-2">
              Quantity:
              <input
                type="number"
                min="1"
                value={orderDetails.quantity}
                onChange={(e) =>
                  setOrderDetails({ ...orderDetails, quantity: Math.max(1, e.target.value) })
                }
                className="w-full mt-1 p-2 rounded-lg border border-gray-800 bg-gray-900"
              />
            </label>

            {/* Contact Field */}
            <label className="block mb-2">
              Contact Info:
              <input
                type="tel"
                placeholder="Phone number"
                id="contact"
                value={orderDetails.contact}
                onChange={(e) => setOrderDetails({ ...orderDetails, contact: e.target.value })}
                className="w-full mt-1 p-2 border border-gray-800 bg-gray-900 rounded-lg"
                required
              />
            </label>

            {/* Phone Number Validation Message */}
            {!/^01[3-9][0-9]{8}$/.test(orderDetails.contact) && orderDetails.contact.length > 0 && (
              <p className="text-red-500 text-sm mt-1">⚠ Please enter a valid phone number</p>
            )}

            {/* Total Price */}
            <h2 className="block mt-4 font-bold">
              Total Price:<span className="text-primary"> ৳{calculateTotal()} BDT</span>
            </h2>
            
            <lebel className="block mt-2 text-sm p-2">
              <input type="checkbox" 
              // value={payment}
              required />
              <span className="ml-2">Cash on Delivary</span>
            </lebel>

            {/* Buttons */}
            <div className="flex justify-end mt-4">
              <button
                className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-lg mr-2"
                onClick={() => setOrderModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`w-full px-4 py-2 rounded-lg font-semibold ${
                  /^01[3-9][0-9]{8}$/.test(orderDetails.contact)
                    ? "bg-primary hover:bg-hover text-white"
                    : "bg-primary text-white cursor-not-allowed"
                }`}
                disabled={loading || !/^01[3-9][0-9]{8}$/.test(orderDetails.contact)}
                onClick={handleOrderSubmit}
              >
                {loading ? <span className="loading loading-ring loading-md"></span> : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfile;