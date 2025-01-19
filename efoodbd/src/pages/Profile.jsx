import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [foodPosts, setFoodPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", description: "", foodImage: null });
  const navigate = useNavigate();
  


  useEffect(() => {
    const email = localStorage.getItem("userEmail");

    if (!email) {
      alert("User is not logged in!");
      navigate("/signin");
      return;
    }

    const fetchProfileData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users?email=${email}`);
        if (!response.ok) throw new Error("Failed to fetch profile data.");
        const data = await response.json();
        setProfileData(data);
        setFormData(data); // Pre-fill the form with current profile data
        if (data.role === "Seller") {
          fetchFoodPosts(data.id); // Fetch seller's posts
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const fetchFoodPosts = async (sellerId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sellers/${sellerId}/posts`);
      if (!response.ok) throw new Error("Failed to fetch food posts.");
      const posts = await response.json();
      setFoodPosts(posts);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sellers/${profileData.id}/orders`);
      if (!response.ok) throw new Error("Failed to fetch orders.");
      const ordersData = await response.json();
      setOrders(ordersData);
    } catch (err) {
      alert("Error fetching orders: " + err.message);
    }
  };

  const handlePostChange = (e) => {
    const { name, value, files } = e.target;
    setNewPost({
      ...newPost,
      [name]: files ? files[0] : value,
    });
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
        try {
            const response = await fetch(`http://localhost:5000/api/foodPosts/${postId}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete post.");
            alert("Post deleted successfully!");
            setFoodPosts((prev) => prev.filter((post) => post.id !== postId)); // Update UI
        } catch (err) {
            alert("Error deleting post: " + err.message);
        }
    }
};


  const handlePostSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("sellerId", profileData.id);
    formDataToSend.append("title", newPost.title);
    formDataToSend.append("description", newPost.description);
    formDataToSend.append("price", newPost.price);
    if (newPost.foodImage) {
      formDataToSend.append("foodImage", newPost.foodImage);
    }

    try {
      const response = await fetch("http://localhost:5000/api/foodPosts", {
        method: "POST",
        body: formDataToSend,
      });
      if (!response.ok) throw new Error("Failed to create food post.");
      alert("Food post created successfully!");
      setNewPost({ title: "", description: "", foodImage: null,price: "" });
      fetchFoodPosts(profileData.id); // Refresh posts
    } catch (err) {
      alert("Error creating food post: " + err.message);
    }
  };

  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!profileData) return <p>Loading...</p>;

  return (
    <div className="bg-primary-content min-h-screen">
      <Header />
      <div className="container mx-auto py-8">
        <div className="max-w-6xl p-6 mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-primary">Profile</h2>
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p><strong>Name:</strong> {profileData.name}</p>
                  <p><strong>Email:</strong> {profileData.email}</p>
                  <p><strong>Phone:</strong> {profileData.phone}</p>
                  <p><strong>Location:</strong> {profileData.location}</p>
                  <p><strong>Role:</strong> {profileData.role}</p>
                </div>
                <div className="w-36 h-36 rounded-full bg-gray-200 border-4 border-primary overflow-hidden">
                  <img
                    // src={seller.profilePicture || "/default-profile.png"}
                    // alt={seller.name}
                    className="w-full h-full object-cover"
                  />
                </div>

              </div>
              <div className="mt-8">
                {/* You can open the modal using document.getElementById('ID').showModal() method */}
                <button className="btn bg-primary hover:bg-hover text-white" onClick={()=>document.getElementById('my_modal_3').showModal()}>Edit Profile</button>
                <dialog id="my_modal_3" className="modal">
                  <div className="modal-box bg-primary-content">
                    <form method="dialog">
                      {/* if there is a button in form, it will close the modal */}
                      <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Hello!</h3>
                    <p className="py-4">Press ESC key or click on ✕ button to close</p>
                  </div>
                </dialog>
              </div>
              {profileData.role === "Seller" && (
                <div className="mt-6">
                  {/* You can open the modal using document.getElementById('ID').showModal() method */}
                  <button className="btn bg-primary text-white hover:bg-hover" onClick={()=>document.getElementById('my_modal_1').showModal()}>Create Post</button>
                  <dialog id="my_modal_1" className="modal">
                    <div className="modal-box bg-primary-content">
                      <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                      </form>
                      <form onSubmit={handlePostSubmit} className="space-y-4 mt-8">
                    <input
                      type="text"
                      name="title"
                      placeholder="Title"
                      value={newPost.title}
                      onChange={handlePostChange}
                      className="border border-gray-600 w-full p-2 rounded"
                    />
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={newPost.description}
                      onChange={handlePostChange}
                      className="border border-gray-600 w-full p-2 rounded"
                      rows="4"
                    ></textarea>
                    <input
                      type="file"
                      name="foodImage"
                      onChange={handlePostChange}
                      className="border border-gray-600 w-full p-2 rounded"
                      accept="image/*"
                    />
                    <input
                      type="number"
                      name="price"
                      placeholder="Price (in BDT)"
                      value={newPost.price}
                      onChange={handlePostChange}
                      className="border border-gray-600 w-full p-2 rounded"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="btn bg-primary hover:bg-hover text-white px-12 rounded-xl"
                      >
                        Post
                      </button>
                    </div>
                  </form>
                    </div>
                  </dialog>
                  <h3 className="text-2xl font-semibold mt-8 text-primary">Your Posts</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {foodPosts.length > 0 ? (
                      foodPosts.map((post) => (
                        <div
                          key={post.id}
                          className="border border-gray-500 rounded shadow-md overflow-hidden bg-primary-content"
                        >
                          <img
                            src={`http://localhost:5000${post.food_image}`}
                            alt={post.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-4">
                            <h4 className="text-lg font-bold text-primary">{post.title}</h4>
                            <p className="text-sm mt-2">{post.description}</p>
                            <p className="text-xl mt-2 font-bold">৳{post.price}</p>
                            <button
                                onClick={() => handleDeletePost(post.id)}
                                className="btn bg-red-600 text-white hover:bg-red-700 mt-4"
                            >
                                Delete Post
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No posts yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
