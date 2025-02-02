import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});
  const [foodPosts, setFoodPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", description: "", foodImage: null });
  const navigate = useNavigate();
  

  useEffect(() => {
    const email = localStorage.getItem("userEmail");

    if (profileData?.id) {
      localStorage.setItem("userId", profileData.id);  // Save user ID in localStorage
    }

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
  }, [navigate, profileData?.id]);

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
      const response = await fetch(`http://localhost:5000/api/sellersOrders`);
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
      document.getElementById('my_modal_1').close();
      setNewPost({ title: "", description: "", foodImage: null,price: "" });
      fetchFoodPosts(profileData.id); // Refresh posts
    } catch (err) {
      alert("Error creating food post: " + err.message);
    }
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


  //profileUpdate
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };


  const handleProfileUpdate = async (e) => {
    e.preventDefault();
  
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("occupation", formData.occupation || "");
    formDataToSend.append("bio", formData.bio || "");
    formDataToSend.append("email", profileData.email); // Required
    formDataToSend.append("role", profileData.role); // Required

    if (profileData.role === "Seller" && formData.foodCategory) {
      formDataToSend.append("foodCategory", formData.foodCategory);
    }

    if (formData.profilePicture) {
      formDataToSend.append("profilePicture", formData.profilePicture);
    }
  
    try {
      const response = await fetch(`http://localhost:5000/api/profileUpdate`, {
        method: "PUT",
        body: formDataToSend,
      });
  
      if (!response.ok) throw new Error("Failed to update profile.");
      const updatedData = await response.json();
      alert("Profile updated successfully!");
      window.location.reload();
      setProfileData(updatedData);
      document.getElementById("editProfileModal").close(); // Close modal after update
    } catch (err) {
      alert("Error updating profile: " + err.message);
    }
  };
  


  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!profileData) return <div className="flex justify-center mt-12"><span className="loading loading-dots loading-md"></span>;</div>

  return (
    <div className="bg-primary-content min-h-screen">
      <Header />
      <div className="container mx-auto py-8">
        <div className="max-w-6xl p-6 mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-primary text-center lg:text-left">Profile</h2>
            <div>
            <div className="flex flex-col lg:flex-row items-center lg:justify-between">
              {/* Profile Data */}
              <div className="lg:w-1/2 text-center lg:text-left mb-4 lg:mb-0">
                <p><strong>Name:</strong> {profileData.name}</p>
                <p><strong>Email:</strong> {profileData.email}</p>
                <p><strong>Phone:</strong> {profileData.phone}</p>
                <p><strong>Your ID:</strong> {profileData.id}</p>
                <p><strong>Location:</strong> {profileData.location}</p>
                {profileData.role === "Seller" && <p><strong>Food Category:</strong> {profileData.foodCategory}</p>}
                <p><strong>Occupation:</strong> {profileData.occupation}</p>
                <p><strong>Role:</strong> {profileData.role}</p>
                <p><strong>Bio:</strong> {profileData.bio}</p>
              </div>
              {/* Profile Picture */}
              <div className="lg:w-1/2 flex justify-center mb-4 lg:mb-0">
                <div className="w-40 h-40 rounded-full bg-gray-200 border-4 border-primary overflow-hidden hover:shadow-md hover:shadow-primary">
                  <img
                    src={`http://localhost:5000${profileData.profilePicture}` || "/default-profile.png"}
                    alt={profileData.name}
                    className="w-full h-full object-cover scale-90 hover:scale-110 ease-in duration-500 items-center"
                  />
                </div>
              </div>
            </div>

              {/* Edit Profile Button and Modal */}
          <div className="mt-8">
            <button
              className="btn bg-primary hover:bg-hover text-white"
              onClick={() => document.getElementById("editProfileModal").showModal()}
            >
              Edit Profile
            </button>
            <dialog id="editProfileModal" className="modal">
              <div className="modal-box bg-primary-content">
                <form method="dialog">
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <h3 className="text-lg font-bold">Edit Profile</h3>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    placeholder="Name"
                    className="w-full p-2 rounded"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    placeholder="Phone"
                    className="w-full p-2 rounded"
                  />
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ""}
                    onChange={handleInputChange}
                    placeholder="Location"
                    className="w-full p-2 rounded"
                  />
                  {profileData.role === "Seller" && (
                    <input
                      type="text"
                      name="foodCategory"
                      value={formData.foodCategory || ""}
                      onChange={handleInputChange}
                      placeholder="Food Category"
                      className="w-full p-2 rounded"
                    />
                  )}
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation || ""}
                    onChange={handleInputChange}
                    placeholder="Occupation"
                    className="w-full p-2 rounded"
                  />
                  
                  <textarea
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleInputChange}
                    placeholder="Describe yourself"
                    className="w-full p-2 rounded"
                    rows="4"
                  ></textarea>
                  <p>Upload your Profile Picture</p>
                  <input
                    type="file"
                    name="profilePicture"
                    onChange={handleInputChange}
                    className="w-full p-2 rounded"
                    accept="image/*"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn bg-primary hover:bg-hover text-white px-12 rounded-xl"
                      
                    >
                      Save
                    </button>
                  </div>
                </form>
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
                      className="w-full p-2 rounded"
                    />
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={newPost.description}
                      onChange={handlePostChange}
                      className="w-full p-2 rounded"
                      rows="4"
                    ></textarea>
                    <input
                      type="file"
                      name="foodImage"
                      onChange={handlePostChange}
                      className="w-full p-2 rounded"
                      accept="image/*"
                    />
                    <input
                      type="number"
                      name="price"
                      placeholder="Price (in BDT)"
                      value={newPost.price}
                      onChange={handlePostChange}
                      className="w-full p-2 rounded"
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
                          className="rounded-2xl shadow-sm hover:shadow-md hover:shadow-gray-500 shadow-gray-500 overflow-hidden"
                        >
                          <img
                            src={`http://localhost:5000${post.food_image}`}
                            alt={post.title}
                            className="w-full h-44 object-cover"
                          />
                          <div className="p-4 bg-gray-900 rounded-lg">
                            <h4 className="text-lg font-bold text-primary">{post.title}</h4>
                            <p className="text-sm mt-1">{post.description}</p>
                            <p className="text-xl mt-1 font-bold">৳{post.price}</p>
                            <p className="text-sm mt-1">{formatDate(post.created_at)}</p>
                            <button
                                onClick={() => handleDeletePost(post.id)}
                                className="btn bg-red-600 text-white hover:bg-red-800 mt-4"
                            >
                                Delete Post
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No posts yet!</p>
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
