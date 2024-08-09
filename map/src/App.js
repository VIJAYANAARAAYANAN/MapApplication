import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MapComponent from './components/MapComponent';
import FilterComponent from './components/FilterComponent';
import logo from '../src/assets/khojle.png';
import './App.css'
function App() {
  const [customers, setCustomers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/dashboard/api');
      setCustomers(response.data);
      setFilteredSellers(response.data); // Initialize with all customers
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFilterChange = (filtered) => {
    setFilteredSellers(filtered);
  };

  return (
    <div >
      <div className='title'>
      <img src="https://assets-cartesian.plotch.io/images/logo/craftsvilla-logo.png" alt="Description of the image" className='logo'/>
      <h2>आपका एआई वाणिज्य सहायक</h2>
      </div>
      {/* <FilterComponent customers={customers} onFilterChange={handleFilterChange} /> */}
      <MapComponent customers={filteredSellers} />
    </div>
  );
}

export default App;

//check