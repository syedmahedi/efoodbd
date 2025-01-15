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
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // Sign up using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      alert("Sign Up Successful!");

      // After signing up, save user data in the appropriate table (Buyer or Seller)
      const apiUrl = role === "Buyer" 
        ? "http://localhost:5000/api/buyers" 
        : "http://localhost:5000/api/sellers";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          location,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save user data to the database.");
      }

      alert("Account created successfully!");
      navigate("/"); // Redirect to the homepage or login page
    } catch (err) {
      setError(err.message);
      console.error("SignUp Error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form
        onSubmit={handleSignUp}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
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
          <label className="block text-gray-700 font-bold mb-2">
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
