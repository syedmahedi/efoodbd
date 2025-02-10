import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInEmail = userCredential.user.email; 

      localStorage.setItem("userEmail", loggedInEmail); 

      // Fetch user role from the backend
      const response = await fetch(`http://localhost:5000/api/users?email=${email}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data.");
      }

      const userData = await response.json();

      if (userData.role === "Seller") {
        navigate("/profile", { state: { showTermsModal: true } });
      } else if (userData.role === "Buyer") {
        navigate("/profile", { state: { showTermsModal: true } });
      } else {
        setError("User role not found.");
      }
    } catch (err) {
      setError(err.message);
    }
    finally {
      setLoading(false); // Reset loading
    }
    setTimeout(() => {
      setError("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-primary-content flex items-center justify-center">
      <form
        onSubmit={handleSignIn}
        className="bg-primary-content p-6 rounded text-primary shadow-md shadow-primary w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        {error && <p className="text-red-500 mb-4 text-center">Provide Valid Email and Password</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-800 bg-gray-900 rounded-lg mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-800 bg-gray-900 rounded-lg mb-4"
        />
        <button
          type="submit"
          className="w-full bg-primary text-white p-2 rounded-xl hover:bg-hover mt-4 flex justify-center items-center font-semibold"
          disabled={loading} // Disable button when loading
        >
          {loading ? (
            <span className="loading loading-ring loading-md"></span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
};

export default SignIn;
