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
    setLoading(true);

    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        setError("⚠ Your email is not verified. Please check your inbox.");
        setLoading(false);
        return;
      }

      // Store email in local storage
      localStorage.setItem("userEmail", user.email);

      // Fetch user role from backend
      const response = await fetch(`http://localhost:5000/api/users?email=${email}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data.");
      }

      const userData = await response.json();
      if (userData.role === "Seller" || userData.role === "Buyer") {
        navigate("/profile", { state: { showTermsModal: true } });
      } else {
        setError("User role not found.");
      }

    } catch (err) {
      setError("⚠ Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }

    setTimeout(() => {
      setError("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-primary-content flex items-center justify-center">
      <form
        onSubmit={handleSignIn}
        className="bg-gray-900 mx-2 p-6 rounded-lg text-white w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Sign In</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-700 bg-gray-800 rounded-lg mb-4"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-700 bg-gray-800 rounded-lg mb-4"
          required
        />
        
        <button
          type="submit"
          className="w-full bg-primary text-white p-2 rounded-lg hover:bg-hover mt-2 flex justify-center items-center font-semibold"
          disabled={loading}
        >
          {loading ? <span className="loading loading-ring loading-md"></span> : "Sign In"}
        </button>

        <p className="mt-4 text-center text-gray-400">
          Not verified? <span className="text-primary cursor-pointer" onClick={() => navigate("/verify-email")}>Verify Now</span>
        </p>
        <div className="text-center text-gray-700 text-sm mt-2">
          &copy; {new Date().getFullYear()} XFoodBD.
        </div>
      </form>
    </div>
  );
};

export default SignIn;
