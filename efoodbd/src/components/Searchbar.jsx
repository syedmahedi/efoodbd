// src/components/SearchBar.jsx
import React, { useState } from "react";

const SearchBar = () => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    alert(`Searching for: ${query}`);
  };

  return (
    <div className="flex items-center bg-white shadow-md rounded-lg p-4">
      <input
        type="text"
        className="flex-grow px-4 py-2 border rounded-lg focus:outline-none"
        placeholder="Search by location or category..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        onClick={handleSearch}
        className="ml-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
