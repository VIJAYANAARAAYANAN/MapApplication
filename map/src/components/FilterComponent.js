import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import './css/FilterComponent.css';

const FilterComponent = ({ customers, onFilterChange }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Fetch categories and cities from backend
  const fetchCategoriesAndCities = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/dashboard/api');
      const data = response.data;
      
      const allCategories = data.flatMap(item => 
        item.category_name.split(',').map(category => category.trim())
      );
      const uniqueCategories = [...new Set(allCategories)];

      // Fetch unique cities
      const uniqueCities = [...new Set(data.map(item => item.seller_city).filter(Boolean))];

      setCategories(uniqueCategories.map(category => ({ value: category, label: category })));
      setCities(uniqueCities.map(city => ({ value: city, label: city })));
    } catch (error) {
      console.error('Error fetching categories and cities:', error);
    }
  };

  useEffect(() => {
    fetchCategoriesAndCities();
  }, []);

  // UseEffect to reset the button to "Apply Filters" when filters change
  useEffect(() => {
    if (filtersApplied) {
      setFiltersApplied(false);
    }
  }, [selectedCategory, selectedLocation]);

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
  };

  const handleLocationChange = (selectedOption) => {
    setSelectedLocation(selectedOption);
  };

  const handleApplyFilters = () => {
    if (filtersApplied) {
      // Remove filters
      setSelectedCategory(null);
      setSelectedLocation(null);
      onFilterChange(customers); // Reset to all customers
    } else {
      // Apply filters
      const filters = {
        category: selectedCategory ? selectedCategory.value : '',
        location: selectedLocation ? selectedLocation.value : ''
      };

      const filtered = customers.filter((seller) => {
        const matchesCategory = filters.category ? seller.category_name.split(',').map(cat => cat.trim()).includes(filters.category) : true;
        const matchesLocation = filters.location ? seller.seller_city === filters.location : true;
        return matchesCategory && matchesLocation;
      });

      console.log('Filters to apply:', filters);
      console.log('Filtered sellers:', filtered);

      onFilterChange(filtered);
    }
    setFiltersApplied(!filtersApplied);
  };

  return (
    <div className="filter-container">
      <div className="dropboxes">
        <Select
          options={categories}
          value={selectedCategory}
          onChange={handleCategoryChange}
          placeholder="Category"
          className="filter-select"
          isClearable
        />
        <Select
          options={cities}
          value={selectedLocation}
          onChange={handleLocationChange}
          placeholder="City"
          className="filter-select"
          isClearable
        />
      </div>
      <button
        onClick={handleApplyFilters}
        className="filter-button"
        disabled={!selectedCategory && !selectedLocation} 
      >
        {filtersApplied ? 'Remove Filters' : 'Apply Filters'}
      </button>
    </div>
  );
};

export default FilterComponent;
