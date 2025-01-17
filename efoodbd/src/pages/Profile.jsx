import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
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
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProfileData();
  }, [navigate]);

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
    formDataToSend.append("role", profileData.role ); 
  
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
  

  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!profileData) return <p>Loading...</p>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Profile</h2>
          {editMode ? (
            <div>
              <label className="block mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="border w-full p-2 mb-4"
              />
              <label className="block mb-2">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="border w-full p-2 mb-4"
              />
              <label className="block mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="border w-full p-2 mb-4"
              />
              <label className="block mb-2">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation || ""}
                onChange={handleInputChange}
                className="border w-full p-2 mb-4"
              />
              <label className="block mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio || ""}
                onChange={handleInputChange}
                className="border w-full p-2 mb-4"
              ></textarea>
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
              <p><strong>Occupation:</strong> {profileData.occupation || "Not specified"}</p>
              <p><strong>Bio:</strong> {profileData.bio || "Not specified"}</p>
              <p>
                <strong>Profile Picture:</strong>{" "}
                {profileData.profilePicture ? (
                  <img src={`http://localhost:5000${profileData.profilePicture}`} alt="Profile" />
                ) : (
                  "Not uploaded"
                )}
              </p>
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
