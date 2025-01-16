import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch email from local storage or authentication context
    const email = localStorage.getItem("userEmail"); // Ensure email is stored after login/signup

    if (!email) {
      alert("User is not logged in!");
      navigate("/signin"); // Redirect to login page if not logged in
      return;
    }

    // Fetch profile data
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users?email=${email}`);

        if (!response.ok) {
          throw new Error("Failed to fetch profile data.");
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching profile data:", err);
      }
    };

    fetchProfileData();
  }, [navigate]);

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!profileData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Profile</h2>
          <p><strong>Name:</strong> {profileData.name}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
          <p><strong>Phone:</strong> {profileData.phone}</p>
          <p><strong>Location:</strong> {profileData.location}</p>
          <p><strong>Role:</strong> {profileData.role}</p>
          {profileData.role === "Seller" && (
            <p><strong>Food Category:</strong> {profileData.foodCategory || "Not specified"}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
