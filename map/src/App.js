import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MapComponent from './components/MapComponent';

function App() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/dashboard/api');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <h1 style={{ fontWeight: 700, fontSize: '25px', color: '#1F51FF',paddingLeft:15, fontStyle:'Roboto'  }}>Seller Locations</h1>
      <MapComponent customers={customers} />
    </div>
  );
}

export default App;
