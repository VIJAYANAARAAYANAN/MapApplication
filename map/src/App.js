import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MapComponent from './components/MapComponent';
import FilterComponent from './components/FilterComponent';

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
    <div>
      <h1 style={{ fontWeight: 700, fontSize: '20px', color: '#1F51FF', paddingLeft: 15, fontFamily: '"Noto Sans", sans-serif' }}>
        Seller Locations
      </h1>
      <FilterComponent customers={customers} onFilterChange={handleFilterChange} />
      <MapComponent customers={filteredSellers} />
    </div>
  );
}


export default App;
