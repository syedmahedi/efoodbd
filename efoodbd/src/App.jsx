// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/signup";
import SignIn from "./pages/signin";
import Profile from "./pages/Profile";
import SellerProfile from "./pages/SellerProfile";
import VerifyEmail from "./pages/verifyEmail";

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/seller/:id" element={<SellerProfile />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </Router>
  );
}

export default App;
