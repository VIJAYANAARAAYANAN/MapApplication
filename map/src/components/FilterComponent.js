import React, { useState } from 'react';

const FilterComponent = ({ onSearch, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    onFilterChange({ category: e.target.value, location });
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    onFilterChange({ category, location: e.target.value });
  };

  return (
    <div className="filter-component">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
      />
      <button onClick={handleSearch}>Search</button>
      <br />
      <select value={category} onChange={handleCategoryChange}>
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="fashion">Fashion</option>
        <option value="grocery">Grocery</option>
        {/* Add more categories as needed */}
      </select>
      <br />
      <select value={location} onChange={handleLocationChange}>
        <option value="">All Locations</option>
        <option value="city1">City 1</option>
        <option value="city2">City 2</option>
        <option value="city3">City 3</option>
        {/* Add more locations as needed */}
      </select>
    </div>
  );
};

export default FilterComponent;
