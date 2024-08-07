import React, { useState } from 'react';
import Select from 'react-select';
import './css/FilterComponent.css';

const cities = [
  'Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 
  'Ahmedabad', 'Pune', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 
  'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 
  'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 
  'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 
  'Vijayawada', 'Aurangabad', 'Jabalpur', 'Amritsar', 'Shimla', 
  'Dehradun', 'Ranchi', 'Bilaspur', 'Gwalior', 'Mysore', 
  'Coimbatore', 'Trivandrum', 'Kochi', 'Chandigarh', 'Udaipur', 
  'Jodhpur', 'Srinagar'
];

const categories = [
  'Electronics', 'Clothing', 'Food', 'Books', 'Furniture', 'Tops'
];

const FilterComponent = ({ onSearch, onFilterChange, onApplyFilters }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchText, setSearchText] = useState('');

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
  };

  const handleLocationChange = (selectedOption) => {
    setSelectedLocation(selectedOption);
  };

  const handleApplyFilters = () => {
    const filters = {
      category: selectedCategory ? selectedCategory.value : '',
      location: selectedLocation ? selectedLocation.value : ''
    };
    console.log("Filters to apply:", filters);
    onFilterChange(filters);
    onSearch(searchText);
    onApplyFilters(filters); // Apply the filters
  };

  return (
    <div className="filter-container">
      <input
        type="text"
        placeholder="Search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="filter-input"
      />
      <div className="dropboxes">
        <Select
          options={categories.map(category => ({ value: category, label: category }))}
          value={selectedCategory}
          onChange={handleCategoryChange}
          placeholder="Select Category"
          className="filter-select"
          isClearable
        />
        <Select
          options={cities.map(city => ({ value: city, label: city }))}
          value={selectedLocation}
          onChange={handleLocationChange}
          placeholder="Select City"
          className="filter-select"
          isClearable
        />
      </div>
      <button onClick={handleApplyFilters} className="filter-button">
        Apply Filters
      </button>
    </div>
  );
};

export default FilterComponent;
