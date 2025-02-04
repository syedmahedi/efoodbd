import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value); // Call fetch function in Home.jsx
  };

  return (
    <div className="flex items-center bg-primary-content-800 shadow-md rounded-lg p-4">
      <input
        type="text"
        className="flex-grow px-4 py-2 border border-gray-500 rounded-lg focus:outline-none"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by food category..."
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
