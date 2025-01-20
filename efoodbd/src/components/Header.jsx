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
    <header className="bg-primary-content py-4 px-2">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold text-primary hover:text-hover">
          <span className="text-gold">e</span>FoodBD
        </Link>
        <nav>
          <ul className="flex gap-6">
            {!user ? (
              <>
                <li>
                  <Link to="/signin">
                    <button className="bg-primary px-4 py-2 rounded-xl text-white font-medium hover:bg-hover">Sign In</button>
                  </Link>
                </li>
                <li>
                  <Link to="/signup">
                    <button className="border-primary px-4 py-2 rounded-xl text-white font-medium hover:bg-hover">Sign Up</button>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-6">         
                  <img
                    src="/notification.png" // Replace with your own image
                    alt="notification"
                    className="h-7 w-7" // Adjust size as needed
                  />
                  <button
                    className="bg-primary px-4 py-2 rounded-xl text-white font-medium hover:bg-hover"
                    onClick={handleProfileClick}
                  >
                    My Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 px-4 py-2 rounded-xl text-white font-medium hover:bg-red-600"
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
