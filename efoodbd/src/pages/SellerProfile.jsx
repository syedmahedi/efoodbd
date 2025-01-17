import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const SellerProfile = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [posts, setPosts] = useState([]);
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

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!seller) {
    return <p className="text-center mt-6">Loading...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      {/* Seller Information */}
      <div className="flex items-center space-x-6">
        <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
          <img
            src={seller.profilePicture || "/default-profile.png"}
            alt={`${seller.name}'s profile`}
            className="w-full h-full object-cover"
          />
        </div>
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

      {/* About Seller */}
      <div className="mt-6">
        <h3 className="text-2xl font-semibold text-gray-800">About the Seller</h3>
        <p className="text-gray-700 mt-3 leading-relaxed">
          {seller.description ||
            "No description provided. This seller has not shared details about their business yet."}
        </p>
      </div>

      {/* Seller Posts */}
      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-gray-800">Seller's Posts</h3>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border rounded-lg shadow-md overflow-hidden bg-gray-50"
              >
                <img
                  src={post.food_image ? `http://localhost:5000${post.food_image}` : "/default-food.jpg"}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="text-lg font-bold text-gray-800">{post.title}</h4>
                  <p className="text-sm text-gray-700 mt-2">{post.description}</p>
                  <button
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    onClick={() => alert(`Order functionality for "${post.title}" is under development!`)}
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 mt-4">No posts available from this seller.</p>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
