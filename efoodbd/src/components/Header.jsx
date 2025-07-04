import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiMenu } from "react-icons/fi";

const Header = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      localStorage.removeItem("location");
      localStorage.removeItem("termsAccepted");
      document.getElementById("signout_modal").close();
      navigate("/signin");
      
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const fetchOrders = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User ID not found.");
      return;
    }

    try {
      console.log("Fetching orders for userId:", userId);
      const response = await axios.get("http://localhost:5000/api/sellerOrders", { params: { userId } });

      console.log("API Response:", response.data);
      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
        document.getElementById("order_modal").showModal(); // Open modal
      } else {
        alert("Failed to fetch orders.");
      }
    } catch (error) {
      alert("An error occurred while fetching orders.");
    }
  };

  const handleProfileClick = () => {
    if (user) {
      navigate("/profile", { state: { email: user.email } });
    }
  };

  const formatDate = (isoDate) => {
    const options = {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-BD", options).format(new Date(isoDate));
  };

  const role = localStorage.getItem("role");

  return (
    <header className="py-4 px-2 m-auto">
      <div className="container mx-auto flex justify-between items-center relative">
      <Link to="/" className="relative text-3xl font-bold text-primary hover:text-hover">
        eFood
        <span className="absolute -top-1.5 -right-6 text-[12px] font-bold  text-white px-1">
          BD
        </span>
      </Link>

        {/* Desktop Menu */}
        <nav className="hidden sm:flex">
          <ul className="flex gap-6">
            {!user ? (
              <>
                <li>
                  <Link to="/signin">
                    <button className="bg-primary px-4 py-2 rounded-xl text-white font-medium hover:bg-hover">
                      Sign In
                    </button>
                  </Link>
                </li>
                <li>
                  <Link to="/signup">
                    <button className="bg-primary px-4 py-2 rounded-xl text-white font-medium hover:bg-hover">
                      Sign Up
                    </button>
                  </Link>
                </li>
              </>
            ) : (
              <>               
                <li className="flex items-center gap-6">
                  {role === "Seller" && (
                  <button onClick={fetchOrders}>
                    <img src="/notification.png" alt="notification" className="h-7 w-7 cursor-pointer" />
                  </button>
                  )}
                  {role === "Seller" && (
                    <div className="relative">
                      <button
                        className="border px-3 py-2 rounded-xl text-white font-medium"
                        onClick={() => {
                          navigator.clipboard.writeText("http://localhost:5173/seller/" + localStorage.getItem("userId"));
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        Share Profile
                      </button>
                      {copied && (
                        <div className="absolute text-green-500 py-2 rounded-md text-center">
                          Your Profile link copied!
                        </div>
                      )}
                    </div>
                  )}                 
                  <button className="bg-primary px-4 py-2 rounded-xl text-white font-medium hover:bg-hover" onClick={handleProfileClick}>
                    My Profile
                  </button>
                </li>
                <li>
                  <button className="bg-red-600 px-4 py-2 rounded-xl text-white font-medium hover:bg-red-800" 
                    onClick={() => document.getElementById('signout_modal').showModal()}>
                    Sign Out
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Three-dot Mobile Menu */}
        <button className="sm:hidden text-2xl text-primary" onClick={() => setMenuOpen(!menuOpen)}>
          <FiMenu />
        </button>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <nav className="sm:hidden absolute top-8 right-0 bg-bgprimary rounded-xl p-6 mb-4 pb-8">
            <ul className="flex flex-col gap-6 text-center">
              {!user ? (
                <>
                  <li>
                    <Link to="/signin">
                      <button className="w-full bg-primary px-4 py-2 rounded-xl text-white font-medium hover:bg-hover">
                        Sign In
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup">
                      <button className="w-full bg-primary px-4 py-2 rounded-xl text-white font-medium hover:bg-hover">
                        Sign Up
                      </button>
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  {role === "Seller" && (
                    <li>
                      <button onClick={fetchOrders}>
                        <img src="/notification.png" alt="notification" className="h-7 w-7 mx-auto cursor-pointer" />
                      </button>                   
                    </li>
                  )}
                  {role === "Seller" && (
                    <div className="">
                      <button
                        className="border px-3 py-2 rounded-xl text-white font-medium"
                        onClick={() => {
                          navigator.clipboard.writeText("http://localhost:5173/seller/" + localStorage.getItem("userId"));
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        Share Profile
                      </button>
                      {copied && (
                        <div className="absolute text-green-500 rounded-md text-center">
                          Profile link copied!
                        </div>
                      )}
                    </div>
                  )} 
                  <li>
                    <button className="w-full bg-primary px-4 py-2 rounded-xl text-white font-medium hover:bg-hover" onClick={handleProfileClick}>
                      My Profile
                    </button>
                  </li>
                  <li>
                  <button className="bg-red-600 px-4 py-2 rounded-xl text-white font-medium hover:bg-red-800" 
                    onClick={() => document.getElementById('signout_modal').showModal()}>
                    Sign Out
                  </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        )}
      </div>

      {/* modal for signout */}
      <dialog id="signout_modal" className="modal modal-bottom sm:modal-middle bg-bgprimary bg-opacity-70">
        <div className="modal-box bg-bgprimary text-gray-400 rounded-lg">
          <h3 className="font-bold text-lg text-center">Are you sure you want to <span className="text-primary">sign out</span> ?</h3>
            <div className="modal-action flex justify-center gap-4">
              <form method="dialog">
                <button className="bg-gray-200 px-6 py-2 rounded-xl text-black font-medium hover:bg-gray-400">No</button>
              </form>
              <button 
                onClick={handleSignOut} 
                className="bg-red-600 px-6 py-2 rounded-xl text-white font-medium hover:bg-red-800">
                  Yes
              </button>
            </div>
        </div>
       </dialog>

      {/* Modal for Orders */}
      <dialog id="order_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-bgprimary text-gray-400 shadow-sm shadow-primary rounded-lg">
          <h2 className="font-bold text-xl text-primary text-center">Your Orders</h2>
          <div className="max-h-60 overflow-y-auto mt-2">
            {orders.length > 0 ? (
              <ul>
                {orders.map((order, index) => (
                  <li key={index} className="border-b py-2">
                    <h1 className="text-lg text-primary font-bold">{index+1}. {order.orderedItem}</h1>
                    <p className="text-sm mt-2"><b>Buyer:</b> {order.buyerName} | {order.buyerLocation}</p>
                    <p className="text-sm mt-1"><b>Contact:</b> {order.contact}</p>
                    <p className="text-sm mt-1"><b>Quantity:</b> {order.quantity}</p>
                    <p className="text-sm mt-1"><b>Total Price:</b> ৳{order.total_price} BDT</p>
                    <p className="text-sm mt-1 mb-1"><b>Date:</b> {formatDate(order.order_date)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No orders found.</p>
            )}
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="mt-4 bg-red-600 px-4 py-2 rounded-xl text-white font-medium hover:bg-red-800">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </header>
  );
};

export default Header;
