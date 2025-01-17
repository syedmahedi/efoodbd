import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleProfileUpdate = async () => {
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });
    if (profilePicture) {
      formDataToSend.append("profilePicture", profilePicture);
    }
    formDataToSend.append("email", localStorage.getItem("userEmail")); // Add email to identify the user
    formDataToSend.append("role", profileData.role);

    try {
      const response = await fetch("http://localhost:5000/api/profileUpdate", {
        method: "PUT",
        body: formDataToSend,
      });
      if (!response.ok) throw new Error("Failed to update profile.");
      alert("Profile updated successfully!");
      setEditMode(false);
      setProfilePicture(null); // Clear the profile picture
    } catch (err) {
      alert("Error updating profile: " + err.message);
    }
  };

  const handlePostChange = (e) => {
    const { name, value, files } = e.target;
    setNewPost({
      ...newPost,
      [name]: files ? files[0] : value,
    });
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("sellerId", profileData.id);
    formDataToSend.append("title", newPost.title);
    formDataToSend.append("description", newPost.description);
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
      setNewPost({ title: "", description: "", foodImage: null });
      fetchFoodPosts(profileData.id); // Refresh posts
    } catch (err) {
      alert("Error creating food post: " + err.message);
    }
  };

  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!profileData) return <p>Loading...</p>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-3xl font-bold mb-6">Profile</h2>
          {editMode ? (
            <div>
              {/* Edit Profile Form */}
              <label className="block mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="border w-full p-2 mb-4 rounded"
              />
              {/* Other Profile Fields */}
              <label className="block mb-2">Profile Picture</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="mb-4"
                accept="image/*"
              />
              <button
                onClick={handleProfileUpdate}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <p><strong>Name:</strong> {profileData.name}</p>
              <p><strong>Email:</strong> {profileData.email}</p>
              <p><strong>Phone:</strong> {profileData.phone}</p>
              <p><strong>Location:</strong> {profileData.location}</p>
              <p><strong>Role:</strong> {profileData.role}</p>
              {/* Seller-Specific: Create and View Posts */}
              {profileData.role === "Seller" && (
                <div className="mt-8">
                  <h3 className="text-2xl font-semibold">Create a Food Post</h3>
                  <form onSubmit={handlePostSubmit} className="space-y-4">
                    <input
                      type="text"
                      name="title"
                      placeholder="Title"
                      value={newPost.title}
                      onChange={handlePostChange}
                      className="border w-full p-2 rounded"
                    />
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={newPost.description}
                      onChange={handlePostChange}
                      className="border w-full p-2 rounded"
                      rows="4"
                    ></textarea>
                    <input
                      type="file"
                      name="foodImage"
                      onChange={handlePostChange}
                      className="border w-full p-2 rounded"
                      accept="image/*"
                    />
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      Post
                    </button>
                  </form>
                  <h3 className="text-2xl font-semibold mt-8">Your Food Posts</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {foodPosts.length > 0 ? (
                      foodPosts.map((post) => (
                        <div
                          key={post.id}
                          className="border rounded shadow-md overflow-hidden bg-gray-50"
                        >
                          <img
                            src={`http://localhost:5000${post.food_image}`}
                            alt={post.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-4">
                            <h4 className="text-lg font-bold">{post.title}</h4>
                            <p className="text-sm text-gray-700">{post.description}</p>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
