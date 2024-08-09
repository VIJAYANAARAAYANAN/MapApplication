import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import './css/FilterComponent.css';
import close from '../assets/closebutton.png'

const FilterComponent = ({ customers, onFilterChange, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  // Fetch categories and cities from backend
  const fetchCategoriesAndCities = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/dashboard/api');
      const data = response.data;

      const allCategories = data.flatMap(item => 
        item.seller_categories ? item.seller_categories.split(',').map(category => category.trim()) : []
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

    const filtered = customers.filter((seller) => {
      const matchesCategory = filters.category ? seller.seller_categories.includes(filters.category) : true;
      const matchesLocation = filters.location ? seller.seller_city === filters.location : true;
      return matchesCategory && matchesLocation;
    });
    onClose()

    console.log('Filters to apply:', filters);
    console.log('Filtered sellers:', filtered);

    onFilterChange(filtered);
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedLocation(null);
    onFilterChange(customers); // Reset to all customers
    onClose();
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      fontFamily: '"Mulish", sans-serif',
      fontSize: '13px',
      color: '#121212 !important',
      borderRadius: '5px',
      border: '1px solid #EDECEC',
      paddingLeft: '30px', 
      position: 'relative',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#999999 !important', 
      fontFamily: '"Mulish", sans-serif',
      fontSize: '13px',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'black !important',
      fontFamily: '"Mulish", sans-serif',
      fontSize: '13px',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#999999', 
      padding: '0 8px', 
      position: 'absolute',
      left: 0, 
      top: '50%',
      transform: 'translateY(-50%)',
    }),
    indicatorSeparator: () => ({
      display: 'none', 
    }),
  };
  
  

  return (
    <div className="filter-container">
      <div className='filterclose'><button className="close-filter-button" onClick={onClose}>
        <img src={close} alt='close' />
        </button></div>
      <div className='filterheading'>
        <h2>Filters</h2>
      </div>
      
      <div className="dropboxes">
        <Select
        options={categories}
        value={selectedCategory}
        onChange={handleCategoryChange}
        placeholder="Category"
        className="filter-select-category"
        isClearable
        styles={customStyles}
      />
      <Select
        options={cities}
        value={selectedLocation}
        onChange={handleLocationChange}
        placeholder="City"
        className="filter-select"
        isClearable
        styles={customStyles}
      />

      </div>
      <div className="filter-buttons">
      <button
          onClick={handleClearFilters}
          className="filter-button-close"
        >
          Clear
        </button>
        <button
          onClick={handleApplyFilters}
          className="filter-button-apply"
          disabled={!selectedCategory && !selectedLocation}
        >
          Apply
        </button>  
      </div>
    </div>
  );
};

export default FilterComponent;
