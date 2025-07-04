import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import Footer from "../components/Footer";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});
  const [foodPosts, setFoodPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", description: "", foodImage: null });
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({ total_orders: 0, total_sales: 0 });
  const id=localStorage.getItem("userId");
  

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    // Check if modal should be shown and hasn't been accepted before
    const handleAcceptTerms = () => {
      localStorage.setItem("termsAccepted", "true"); // Store in localStorage
      setShowModal(false);
    };  

    if (profileData?.id) {
      localStorage.setItem("userId", profileData.id);  // Save user ID in localStorage
      localStorage.setItem("role", profileData.role);  // Save user role in localStorage
      localStorage.setItem("location", profileData.location);  // Save user location in localStorage
    }

    if (!email) {
      setMessage("You need to sign in first.");
      setMessageType("error");
      navigate("/signin");
      return;
    }

    const fetchProfileData = async () => {
      try {
        if (location.state?.showTermsModal && !localStorage.getItem("acceptedTerms")) {
          setShowModal(true);
        }    
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

    const fetchStats = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/seller-stats/${id}}`);
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

    fetchProfileData();
  }, [navigate, profileData?.id, location.state, id]);

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

  

  const handlePostChange = (e) => {
    const { name, value, files } = e.target;
    setNewPost({
      ...newPost,
      [name]: files ? files[0] : value,
    });
  };

  const handleDeletePost = async (postId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/foodPosts/${postId}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete post.");
            setFoodPosts((prev) => prev.filter((post) => post.id !== postId)); // Update UI
        } catch (err) {
            setMessage("Failed to delete post.");
            setMessageType("error");
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
      setMessage("Post created successfully!");
      setMessageType("success");
      document.getElementById('my_modal_1').close();
      setNewPost({ title: "", description: "", foodImage: null,price: "" });
      fetchFoodPosts(profileData.id); // Refresh posts
    } catch (err) {
      setMessage("Failed to create post.");
      setMessageType("error");
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
    formDataToSend.append("email", profileData.email); 
    formDataToSend.append("role", profileData.role); 

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
      setProfileData(updatedData);
      document.getElementById("editProfileModal").close(); // Close modal after update
      setMessage("Profile updated successfully!");
      setMessageType("success");
    } catch (err) {
      setMessage("Failed to update profile.");
      setMessageType("error");
    }
  };

  setTimeout(() => {
    setMessage(null);
    setMessageType(null);
  }, 5000);
  

  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (!profileData) return <div className="flex justify-center items-center mt-12"><span className="loading loading-dots loading-md"></span></div>

  return (
    <div className="bg-bgprimary min-h-screen">
      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.p
            initial={{ y: -50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.5 }} 
            className={`fixed top-6 left-0 right-0 z-50 text-center ${
            messageType === "success" ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
          </motion.p>
        )}
      </AnimatePresence>
      <Header />
      <div className="container mx-auto py-8">
        <div className="max-w-6xl sm:p-6 mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-primary text-center lg:text-left"><h1>{profileData.name}</h1></h2>
            <div>
            <div className="flex flex-col lg:flex-row items-center lg:justify-between">
              {/* Profile Data */}
              <div className="lg:w-1/2 text-center lg:text-left text-gray-500 mb-4 lg:mb-0">
                <p><strong>Email:</strong> {profileData.email}</p>
                <p><strong>Phone:</strong> {profileData.phone}</p>
                <p><strong>Your ID:</strong> {profileData.id}</p>
                <p><strong>Location:</strong> {profileData.location}</p>
                {profileData.role === "Seller" && <p><strong>Food Category:</strong> {profileData.foodCategory}</p>}
                <p><strong>Occupation:</strong> {profileData.occupation}</p>
                <p><strong>Role:</strong> {profileData.role}</p>
                <p><strong>Bio:</strong> {profileData.bio}</p>
              </div>
              {/* Seller Stats */}
              <div className="grid grid-cols-2 gap-12  bg-bgprimary sm:p-4 pb-8 sm:pb-0 rounded-lg w-full max-w-xs">
                <div className="text-center">
                  <p className="stat-title text-gray-500 font-semibold">Total Orders</p>
                  <p className="stat-value text-primary text-3xl font-bold">{stats.total_orders}</p>
                </div>
                <div className="text-center">
                  <p className="stat-title text-gray-500 font-semibold">Total Sales</p>
                  <p className="stat-value text-primary text-3xl font-bold">৳{stats.total_sales} BDT</p>
                </div>
              </div>
              {/* Profile Picture */}
              <div className="lg:w-1/2 flex justify-center mb-4 lg:mb-0">
                <div className="w-40 h-40 rounded-full bg-gray-200 border-4 border-primary overflow-hidden hover:shadow-md hover:shadow-primary">
                  <img
                    src={profileData.profilePicture ? `http://localhost:5000${profileData.profilePicture}` : "/default-profile.png"}
                    alt={profileData.name}
                    className="text-center w-full h-full object-cover scale-100 hover:scale-110 ease-in duration-500 items-center"
                  />
                </div>
              </div>
            </div>

            {/* Buttons Container */}
            <div className="mt-8 flex flex-wrap gap-4 items-center lg:justify-start justify-center">
              {/* Edit Profile Button */}
              <button
                className="bg-primary px-4 py-2.5 rounded-xl text-white font-medium hover:bg-hover"
                onClick={() => document.getElementById("editProfileModal").showModal()}
              >
                Edit Profile
              </button>

              {/* Create Post Button (Only for Sellers) */}
              {profileData.role === "Seller" && (
                <button
                  className="bg-primary px-4 py-2.5 rounded-xl text-white font-medium hover:bg-hover"
                  onClick={() => document.getElementById("my_modal_1").showModal()}
                >
                  Create Post
                </button>
              )}
              {/* {profileData.role === "Seller" && (
                <button
                  className="bg-primary px-4 py-2.5 rounded-xl text-white font-medium hover:bg-hover"
                  onClick={() => navigate("/orders")}
                >
                  Share Profile
                </button>
              )} */}
            </div>

            {/* Edit Profile Modal */}
            <dialog id="editProfileModal" className="modal bg-bgprimary bg-opacity-60">
              <div className="modal-box bg-bgprimary text-gray-400 shadow-sm shadow-primary">
                <form method="dialog">
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 hover:bg-slate-800 top-2">✕</button>
                </form>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <h3 className="text-lg font-bold text-primary text-center">Edit Profile</h3>
                  <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Name" className="w-full p-2 rounded-lg border border-gray-800 bg-gray-900" />
                  <input type="text" name="phone" value={formData.phone || ""} onChange={handleInputChange} placeholder="Phone" className="w-full p-2 rounded-lg border border-gray-800 bg-gray-900" />
                  <input type="text" name="location" value={formData.location || ""} onChange={handleInputChange} placeholder="Location" className="w-full p-2 rounded-lg border border-gray-800 bg-gray-900" />
                  {profileData.role === "Seller" && <input type="text" name="foodCategory" value={formData.foodCategory || ""} onChange={handleInputChange} placeholder="Food Category" className="w-full p-2 rounded-lg border border-gray-800 bg-gray-900" />}
                  <input type="text" name="occupation" value={formData.occupation || ""} onChange={handleInputChange} placeholder="Occupation" className="w-full p-2 rounded-lg border border-gray-800 bg-gray-900" />
                  <textarea name="bio" value={formData.bio || ""} onChange={handleInputChange} placeholder="Describe yourself" className="w-full p-2 rounded-lg border border-gray-800 bg-gray-900" rows="3"></textarea>
                  <p>Upload your Profile Picture (Max 2Mb)</p>
                  <input type="file" name="profilePicture" onChange={handleInputChange} className="w-full p-1.5 rounded-lg bg-gray-900" accept="image/*" />
                  <div className="flex justify-end">
                    <button type="submit" className="bg-primary px-12 py-2.5 rounded-xl text-white font-medium hover:bg-hover">Save</button>
                  </div>
                </form>
              </div>
            </dialog>

            {/* Create Post Modal (Only for Sellers) */}
            {profileData.role === "Seller" && (
              <dialog id="my_modal_1" className="modal bg-bgprimary bg-opacity-60">
                <div className="modal-box bg-bgprimary text-gray-400 shadow-sm shadow-primary">
                  <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                  </form>
                  <form onSubmit={handlePostSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold text-primary text-center">Create Post</h3>
                    <input type="text" name="title" placeholder="Title (e.g. Home Cooked Biryani)" value={newPost.title} onChange={handlePostChange} className="w-full p-2 rounded-lg border border-gray-800 bg-gray-900" />
                    <textarea name="description" placeholder="Description (e.g. Ingredients, Quantity, etc)" value={newPost.description} onChange={handlePostChange} className="w-full p-2 rounded-lg border border-gray-800 bg-gray-900" rows="4"></textarea>
                    <p>Upload Your Food Image</p>
                    <input type="file" name="foodImage" onChange={handlePostChange} className="w-full rounded-lg border p-1.5 border-gray-800 bg-gray-900" accept="image/*" />
                    <input type="number" name="price" placeholder="Price (in BDT)" value={newPost.price} onChange={handlePostChange} className="w-full p-2 rounded-lg border border-gray-800 bg-gray-900" />
                    <div className="flex justify-end">
                      <button type="submit" className="bg-primary px-12 py-2.5 rounded-xl text-white font-medium hover:bg-hover">Post</button>
                    </div>
                  </form>
                </div>
              </dialog>
            )}

            {/* Your Posts Section */}
            {profileData.role === "Seller" && (
              <div className="text-gray-400">
                <h3 className="text-2xl font-semibold mt-8 text-primary">Your Posts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {foodPosts.length > 0 ? (
                    foodPosts.map((post) => (
                      <div key={post.id} className="rounded-2xl shadow-sm hover:shadow-md hover:shadow-gray-500 shadow-gray-500 max-h-fit overflow-hidden">
                        <img src={`http://localhost:5000${post.food_image}`} alt={post.title} className="w-full h-44 object-cover" />
                        <div className="p-4 bg-gray-900 rounded-lg">
                          <h4 className="text-lg font-bold text-primary">{post.title}</h4>
                          <p className="text-sm mt-2 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                            {post.description.length > 25 ? (
                              <>
                                {post.description.substring(0, 35)}...
                                <button
                                  className="text-primary hover:underline ml-1"
                                  onClick={()=>document.getElementById('see_more').showModal()}
                                >
                                  See more
                                </button>
                                <dialog id="see_more" className="modal">
                                  <div className="modal-box bg-gray-900">
                                    <form method="dialog">
                                      <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                                    </form>
                                    <h3 className="font-bold text-center text-primary text-lg">Food Description</h3>
                                    <p className="py-4">{post.description}</p>
                                  </div>
                                </dialog>
                              </>
                            ) : (
                              post.description
                            )}
                          </p>
                          <p className="text-xl mt-1 font-bold">৳{post.price}</p>
                          <p className="text-sm mt-1">{formatDate(post.created_at)}</p>
                          <button onClick={() => document.getElementById('delete_modal').showModal()} className="px-4 py-2.5 rounded-xl font-medium bg-red-600 text-white hover:bg-red-800 mt-4">
                            Delete Post
                          </button>
                          <dialog id="delete_modal" className="modal modal-bottom sm:modal-middle bg-primary-content bg-opacity-60">
                            <div className="modal-box bg-gray-900 rounded-lg">
                              <h3 className="font-bold text-lg text-center">Are you sure you want to <span className="text-primary">Delete</span> the post ?</h3>
                              <div className="modal-action flex justify-center gap-4">
                                <form method="dialog">
                                  <button className="bg-gray-200 px-6 py-2 rounded-xl text-black font-medium hover:bg-gray-400">No</button>
                                </form>
                                <button 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="bg-red-600 px-6 py-2 rounded-xl text-white font-medium hover:bg-red-800">
                                  Yes
                                </button>
                              </div>
                            </div>
                          </dialog>
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
        {/* Terms and Conditions Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-bgprimary bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-full h-auto mx-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-center text-primary">Terms & Conditions</h2>
            <p className="text-sm mb-4">
                <ul className="list-disc list-inside text-sm text-gray-400 space-y-2">
                  <li><strong>eFoodBD</strong> একটি মধ্যস্থতাকারী প্ল্যাটফর্ম যা ক্রেতা ও বিক্রেতাদের সংযোগ স্থাপন করে; আমরা কোনো লেনদেন, অর্থপ্রদান বা ডেলিভারির জন্য দায়ী নই।</li>
                  <li>সকল লেনদেন ব্যবহারকারীদের ব্যক্তিগত দায়িত্ব, এবং প্রতারণা, পেমেন্ট বা বিতরণ সংক্রান্ত সমস্যা <strong>eFoodBD</strong>-এর আওতাভুক্ত নয়।</li>
                  <li>ব্যবহারকারীদের অবশ্যই <strong>সঠিক ও বৈধ তথ্য</strong> প্রদান করতে হবে, এবং প্রতারণামূলক কার্যকলাপে লিপ্ত হওয়া সম্পূর্ণ নিষিদ্ধ।</li>
                  <li><strong>eFoodBD</strong> প্রতারক কার্যকলাপ শনাক্তকরণ ও প্রতিরোধের জন্য তথ্য সংগ্রহ ও বিশ্লেষণ করতে পারে, যা গোপনীয়তা নীতির অধীনে সংরক্ষিত থাকবে।</li>
                </ul>
            </p>
            <button
              onClick={() => {
                localStorage.setItem("termsAccepted", "true"); // Store acceptance in localStorage
                setShowModal(false); // Hide the modal
              }}
              className="bg-primary text-white p-2 rounded-lg w-full"
            >
              Accept & Continue
            </button>
          </div>
        </div>        
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
