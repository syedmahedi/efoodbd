import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState(""); 
  const [foodCategory, setFoodCategory] = useState(""); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Firebase sign-up
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);
      setMessage("Verification email sent. Please check your inbox.");

      // Save user data in database (only after email verification)
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          location,
          role,
          foodCategory: role === "Seller" ? foodCategory : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to save user data.");

      // Store email in localStorage
      localStorage.setItem("userEmail", email);

      // Redirect with email verification reminder
      navigate("/verify-email");

    } catch (err) {
      setMessage(err.message || "Failed to sign up. Try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-primary-content flex items-center justify-center">
      <form
        onSubmit={handleSignUp}
        className="bg-primary-content p-6 rounded shadow-md shadow-primary w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Sign Up</h2>
        {message && <p className="fixed top-6 left-0 right-0 z-50 text-red-500 mb-4 text-center">{message}</p>}
        
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-800 bg-gray-900 rounded-lg"
        />
        
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-4 p-2 border border-gray-800 bg-gray-900 rounded-lg"
        />
        
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full mt-4 p-2 border border-gray-800 bg-gray-900 rounded-lg"
        />
        
        <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)}
          className={`w-full mt-4 p-2 border rounded-lg ${phone && !/^01[3-9][0-9]{8}$/.test(phone) ? "border-red-500" : "border-gray-800"} bg-gray-900`}
          required
        />
        {phone && !/^01[3-9][0-9]{8}$/.test(phone) && (
          <p className="text-red-500 mt-1">⚠ Please enter a valid phone number</p>
        )}
        
        <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)}
          className="w-full mt-4 mb-2 p-2 border border-gray-800 bg-gray-900 rounded-lg"
        />

        <div className="mb-4">
          <label className="block text-gray-500 font-bold mb-2">Choose Your Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-gray-800 bg-gray-900 rounded-lg"
          >
            <option value="" disabled hidden>Select Role</option>
            <option value="Buyer">Buyer</option>
            <option value="Seller">Seller</option>
          </select>
        </div>

        {role === "Seller" && (
          <input type="text" placeholder="Food Category (e.g., Cakes)" value={foodCategory}
            onChange={(e) => setFoodCategory(e.target.value)}
            className="w-full mt-2 p-2 border border-gray-800 bg-gray-900 rounded-lg"
          />
        )}

        <button type="submit"
          className="w-full bg-primary text-white p-2 rounded-lg hover:bg-hover font-semibold mt-6"
          disabled={!role || loading || !phone || !name || !location}
        >
          {loading ? <span className="loading loading-ring loading-md"></span> : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignUp;