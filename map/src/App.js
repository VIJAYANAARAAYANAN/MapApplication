import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MapComponent from './components/MapComponent';
import FilterComponent from './components/FilterComponent';
import './App.css';

function App() {
  const [customers, setCustomers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/dashboard/api');
      setCustomers(response.data);
      setFilteredSellers(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFilterChange = (filtered) => {
    setFilteredSellers(filtered);
  };

  const toggleFilterPopup = () => {
    setShowFilterPopup(!showFilterPopup);
  };

  return (
    <div>
      <div className='title'>
        <img src="https://assets-cartesian.plotch.io/images/logo/craftsvilla-logo.png" alt="Description of the image" className='logo'/>
        <h2>आपका एआई वाणिज्य सहायक</h2>
      </div>
      <MapComponent customers={filteredSellers} onFilterButtonClick={toggleFilterPopup} />
      
      {showFilterPopup && (
        <div className="filter-popup">
          <FilterComponent customers={customers} onFilterChange={handleFilterChange} onClose={toggleFilterPopup} />
        </div>
      )}
    </div>
  );
}

export default App;
