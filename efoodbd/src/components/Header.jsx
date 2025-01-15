import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert("You have successfully signed out.");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleProfileClick = () => {
    if (user) {
      navigate("/profile", { state: { email: user.email } });
    }
  };

  return (
    <header className="bg-primary text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          eFoodBD
        </Link>
        <nav>
          <ul className="flex gap-6">
            {!user ? (
              <>
                <li>
                  <Link
                    to="/signin"
                    className="hover:underline text-white font-medium"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="hover:underline text-white font-medium"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <span
                    className="font-medium cursor-pointer hover:underline"
                    onClick={handleProfileClick}
                  >
                    Welcome, {user.email.split("@")[0]}!
                  </span>
                </li>
                <li>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-500 px-4 py-2 rounded text-white font-medium hover:bg-red-600"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
