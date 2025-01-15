import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const { state } = useLocation(); // Retrieve the state object passed via navigation
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("State passed to Profile:", state); // Debugging: Check state object

    if (state?.id) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/profile/${state.id}`
          );
          console.log("API Response Data:", response.data); // Log fetched data
          setUserData(response.data);
        } catch (err) {
          setError("Failed to fetch user data.");
          console.error("API Error:", err); // Log error
        }
      };

      fetchUserData();
    } else {
      setError("No user ID provided.");
    }
  }, [state]);

  // Render conditionally based on state and API response
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Profile Details</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {userData ? (
          <div>
            <p>
              <strong>Name:</strong> {userData.name}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Phone:</strong> {userData.phone}
            </p>
            <p>
              <strong>Location:</strong> {userData.location}
            </p>
          </div>
        ) : (
          <p className="text-center">Loading profile...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
