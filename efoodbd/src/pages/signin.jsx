import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInEmail = userCredential.user.email; // Get the email from the user object
      alert("Sign In Successful!");

      localStorage.setItem("userEmail", loggedInEmail); // save email in local storage

      // Fetch user role from the backend
      const response = await fetch(`http://localhost:5000/api/users?email=${email}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data.");
      }

      const userData = await response.json();

      if (userData.role === "Seller") {
        navigate("/profile"); // Navigate to Seller Dashboard
      } else if (userData.role === "Buyer") {
        navigate("/profile"); // Navigate to Buyer Dashboard
      } else {
        setError("User role not found.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-primary-content flex items-center justify-center">
      <form
        onSubmit={handleSignIn}
        className="bg-primary-content p-6 rounded text-primary shadow-md shadow-primary w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6">Sign In</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
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
        <button
          type="submit"
          className="w-full bg-primary text-white p-2 rounded-xl hover:bg-hover mt-4"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default SignIn;
