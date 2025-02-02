import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState(""); // To distinguish between Buyer and Seller
  const [foodCategory, setFoodCategory] = useState(""); // Only for sellers
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // Sign up using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const signedUpEmail = userCredential.user.email;

      // After signing up, save user data in the database
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          location,
          role,
          foodCategory: role === "Seller" ? foodCategory : null, // Only include for sellers
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save user data to the database.");
      }
      
      // Store email in localStorage
      localStorage.setItem("userEmail", signedUpEmail);

      alert("Account created successfully!");
      navigate("/"); // Redirect to the homepage or login page
    } catch (err) {
      setError(err.message);
      console.error("SignUp Error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-primary-content flex items-center justify-center">
      <form
        onSubmit={handleSignUp}
        className="bg-primary-content p-6 rounded text-primary shadow-md shadow-primary w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <div className="mb-4">
          <label className="block text-gray-600 font-bold mb-2">
            Choose Your Role:
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="Buyer">Buyer</option>
            <option value="Seller">Seller</option>
          </select>
        </div>

        {role === "Seller" && (
          <input
            type="text"
            placeholder="Food Category (e.g., Cakes)"
            value={foodCategory}
            onChange={(e) => setFoodCategory(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
        )}

        <button
          type="submit"
          className="w-full bg-primary text-white p-2 rounded hover:bg-hover"
          disabled={!role} // Disable button until role is selected
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;