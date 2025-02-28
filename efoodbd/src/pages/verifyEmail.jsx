import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { sendEmailVerification, onAuthStateChanged } from "firebase/auth";

const VerifyEmail = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleCheckVerification = async () => {
    setLoading(true);
    await user.reload(); // Reload user info from Firebase
    if (user.emailVerified) {
      setMessage("✅ Email verified! Redirecting to login...");
      setTimeout(() => navigate("/signin"), 2000);
    } else {
      setMessage("⚠ Email not verified yet. Please check your inbox.");
    }
    setLoading(false);
  };

  const handleResendEmail = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await sendEmailVerification(user);
      setMessage("📩 Verification email sent again. Please check your inbox.");
    } catch (error) {
      setMessage("⚠ Failed to resend email. Try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgprimary">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md text-primary">
        <h2 className="text-2xl font-bold text-center mb-4">Verify Your Email</h2>
        <p className="text-center text-gray-300">
          We have sent a verification link to your email. Please check your inbox.
        </p>

        {message && <p className="mt-4 text-center text-yellow-400">{message}</p>}

        <div className="mt-6 flex flex-col space-y-3">
          <button
            onClick={handleCheckVerification}
            disabled={!user || loading}
            className="bg-primary hover:bg-hover text-white py-2 px-4 rounded-md text-center"
          >
            {loading ? "Checking..." : "Check Verification"}
          </button>

          <button
            onClick={handleResendEmail}
            disabled={!user || loading}
            className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-md text-center"
          >
            {loading ? "Resending..." : "Resend Verification Email"}
          </button>
        </div>
        <div className="text-center text-gray-700 text-sm pt-4">
          &copy; {new Date().getFullYear()} eFoodBD.
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
