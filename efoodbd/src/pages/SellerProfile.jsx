import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";

const SellerProfile = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null); // For the selected food post
  const [orderModalOpen, setOrderModalOpen] = useState(false);

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
  

  const handleOrderSubmit = async () => {
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
        alert("Are you loged in? Provide valid information");
        return;
      }

      alert("Order placed successfully!");
      setOrderModalOpen(false);
      setOrderDetails({ quantity: 1, contact: "" });
    } catch (err) {
      alert(`Error placing order: ${err.message}`);
    }
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!seller) {
    return <p className="text-center mt-6">Loading...</p>;
  }



  return (
    <div className="bg-primary-content min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto p-6 rounded-lg py-8">
        {/* Seller Information */}
        <div className="flex items-center space-x-6">
          <div className="w-36 h-36 rounded-full bg-gray-200 border-4 border-primary overflow-hidden">
            <img
              src={seller.profilePicture ? `http://localhost:5000${seller.profilePicture}` : "/default-profile.png"}
              className="w-full h-full object-cover scale-90 hover:scale-110 ease-in duration-500 items-center"
              alt="Seller Profile"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-primary">{seller.name}</h2>
            <p className="mt-1">
              <span className="font-semibold">Location:</span> {seller.location}
            </p>
            <p>
              <span className="font-semibold">Category:</span> {seller.foodCategory}
            </p>
            <p>
              <span className="font-semibold">Seller ID: </span> {seller.id}
            </p>
          </div>
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
          <div className="bg-primary-content p-6 rounded-lg max-w-md w-full">
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
                className="w-full mt-1 p-2 rounded border border-gray-800 bg-gray-900"
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
                className="w-full mt-1 p-2 border border-gray-800 bg-gray-900 rounded"
                required
              />
            </label>

            {/* Phone Number Validation Message */}
            {!/^01[3-9][0-9]{8}$/.test(orderDetails.contact) && orderDetails.contact.length > 0 && (
              <p className="text-red-500 text-sm mt-1">⚠ Please enter a valid BD phone number (e.g. 017***8)</p>
            )}

            {/* Total Price */}
            <h2 className="block mt-4 font-bold">
              Total Price:<span className="text-primary"> ৳{calculateTotal()} BDT</span>
            </h2>

            {/* Buttons */}
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-lg mr-2"
                onClick={() => setOrderModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg font-semibold ${
                  /^01[3-9][0-9]{8}$/.test(orderDetails.contact)
                    ? "bg-primary hover:bg-hover text-white"
                    : "bg-primary text-white cursor-not-allowed"
                }`}
                disabled={!/^01[3-9][0-9]{8}$/.test(orderDetails.contact)}
                onClick={handleOrderSubmit}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfile;
