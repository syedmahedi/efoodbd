import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = localStorage.getItem("location");

  const handleSearch = (e) => {
    if (!location) {
      alert("Location not set. Please sign in first.");
      return;
    }
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value, location); // Pass both search term & location
  };

  return (
    <div className="flex items-center text-gray-400 justify-center bg-bgprimary shadow-md rounded-lg p-4">
      <input
        type="text"
        className="flex-grow px-4 py-2 border border-gray-600 bg-bgprimary rounded-lg focus:outline-none"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by food category (e.g., cake)"
      />
      <button
        onClick={handleSearch}
        className="ml-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-hover"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
