import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import close from '../assets/closebutton.png';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import ReactDOM from 'react-dom';
import { CarouselComponent } from './CarouselHelper';
import './MapComponent.css';
import './popup.css';
import UserLocationMarker from './UserLocationMarker'; // Import the new component

import filtericon from '../assets/filter.png';
//import FilterComponent from './FilterComponent';
// Define custom icons
const customIcon = L.icon({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -36]
});

// Define custom active icon
const customActiveIcon = L.icon({
  iconRetinaUrl: require('../assets/output-onlinegiftools.gif'), // Update with your active icon path
  iconUrl: require('../assets/output-onlinegiftools.gif'), // Update with your active icon path
  iconSize: [42, 50],
  iconAnchor: [25, 39],
  popupAnchor: [0, -36]
});

// Calculate distance between two points
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Outside Popup Component
const OutsidePopupComponent = ({ seller, onClose }) => {
  if (!seller) return null;

  // Prepare image rows for display
  const imageRows = [];
  const productCategories = seller.product_categories.split('|'); // Split categories into an array

  const formatPrice = (price) => {
    return parseFloat(price).toString().replace(/(\.\d*?[1-9])0+$/, '$1'); // Removes trailing zeros
  };

  const formatText = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  for (let i = 0; i < seller.product_images.length; i += 4) {
    imageRows.push(
      <div className="image-row" key={i}>
        {seller.product_images.slice(i, i + 4).map((image, index) => (
          <div key={index} className="image-item">
            <a href={seller.seller_url} target="_blank" rel="noopener noreferrer">
              <img src={image} alt={`Product ${i + index + 1}`} className="popup-image" />
            </a>
            <div className="image-info">
              <p>{formatText(seller.product_names[i + index])}</p>
              <p3>{formatText(productCategories[i + index])}</p3> {/* Display the category */}
              <div className='prices'>
                <p1>₹{formatPrice(seller.product_sale_prices[i + index])}</p1>
                <p2>₹{formatPrice(seller.product_mrps[i + index])}</p2>
                <div className='offer'>
                  <p3>41% OFF</p3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Get the first category from the list
  const firstCategory = formatText(productCategories[0]);
  const formattedSellerName = formatText(seller.seller_name);

  return (
    <div className="outside-popup">
      <button className="popup-close-button" onClick={onClose}>
        <img src={close} alt='close' />
      </button>
      <h2>
        <a href={seller.seller_url} target="_blank" rel="noopener noreferrer">
          {formattedSellerName} <span style={{ fontSize: 18 }}>({seller.product_count} items)</span>
        </a>
      </h2>
      <div className='subinfo-div'>
        <span className='distancevalue'>
          {seller.distance !== undefined && `${seller.distance.toFixed(2)} km`}
        </span>
        <p className='dot'>.</p>
        <p>{firstCategory}</p>
      </div>

      <div className="image-grid">
        {imageRows}
      </div>
    </div>
  );
};


// Component for clustering markers
const ClusteringMarkers = ({ customers, userLocation, showNearby, onMarkerClick }) => {
  const map = useMap();
  const [activeMarkerId, setActiveMarkerId] = useState(null);

  useEffect(() => {
    if (!map) return;

    const markers = L.markerClusterGroup({
      disableClusteringAtZoom: 16
    });

    const filteredCustomers = showNearby && userLocation
      ? customers.filter(customer => {
        const [lat, lon] = customer.seller_lat_long.split(',').map(coord => parseFloat(coord));
        const distance = getDistance(userLocation.lat, userLocation.lon, lat, lon);
        return distance <= 50;
      })
      : customers;

    filteredCustomers.forEach((customer, index) => {
      const [lat, lon] = customer.seller_lat_long.split(',').map(coord => parseFloat(coord));

      // Validate latitude and longitude
      if (isNaN(lat) || isNaN(lon)) {
        console.error(`Invalid LatLng object for customer ${customer.seller_name}: (${lat}, ${lon})`);
        return;
      }

      const images = Array.isArray(customer.product_images)
        ? customer.product_images.filter(url => url.startsWith('http')).slice(0, 7)
        : [];

      const markerIcon = activeMarkerId === index ? customActiveIcon : customIcon; // Use active icon if selected

      const marker = L.marker([lat, lon], { icon: markerIcon })
        .bindPopup(
          `<div class="popup-content">
            <a href="${customer.seller_url}" target="_blank" class="popup-seller-name">${customer.seller_name}</a><br />
            <div id="carousel-${lat}-${lon}" class="popup-carousel"></div>
          </div>`
        );

      markers.addLayer(marker);

      marker.on('click', () => {
        const carouselWrapper = document.getElementById(`carousel-${lat}-${lon}`);
        ReactDOM.render(<CarouselComponent images={images} sellerUrl={customer.seller_url} />, carouselWrapper);
        onMarkerClick(customer); // Update the selected seller state
        setActiveMarkerId(index); // Set the active marker id
      });
    });

    map.addLayer(markers);

    markers.on('clustermouseover', (event) => {
      event.layer.getElement().classList.add('marker-cluster-small');
    });

    markers.on('clustermouseout', (event) => {
      event.layer.getElement().classList.remove('marker-cluster-small');
    });

    return () => {
      map.removeLayer(markers);
    };
  }, [customers, userLocation, showNearby, map, onMarkerClick, activeMarkerId]);

  return null;
};

// Component to handle map view changes with smooth transition
const MapViewAdjuster = ({ showNearby, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (showNearby && userLocation) {
      map.flyTo([userLocation.lat, userLocation.lon], 9, {
        animate: true,
        duration: 0.7,
      });
    } else {
      map.flyTo([20.5937, 78.9629], 5, {
        animate: true,
        duration: 0.7,
      });
    }
  }, [showNearby, userLocation, map]);

  return null;
};

// Main Map Component
const MapComponent = ({ customers, onFilterButtonClick }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [showNearby, setShowNearby] = useState(true); // Set to true by default
  const [selectedSeller, setSelectedSeller] = useState(null);

  // Fetch user location when the component mounts
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        error => {
          console.error("Error getting user's location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const toggleNearby = () => {
    setShowNearby(!showNearby);
  };

  const handleMarkerClick = (seller) => {
    if (userLocation) {
      const [lat, lon] = seller.seller_lat_long.split(',').map(coord => parseFloat(coord));
      const distance = getDistance(userLocation.lat, userLocation.lon, lat, lon);
      setSelectedSeller({ ...seller, distance });
    } else {
      setSelectedSeller(seller);
    }
  };

  const handleClosePopup = () => {
    setSelectedSeller(null);
  };

  
    return (
      <div className="map-container-wrapper">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} className="map-container">
        <div className='main'>
        <div className='mapbuttons'>
          <div>
            <button
              className={`showbutton ${showNearby ? 'show-nearby-active' : 'show-all-active'}`}
              onClick={toggleNearby}
            >
              {showNearby ? 'Show All' : 'Show Nearby'}
            </button>
            <button className='filterbutton' onClick={onFilterButtonClick}>
              Filter 
              <span className='filtericon'>
                <img src={filtericon} alt="Filter icon" />
              </span>
            </button>
          </div>
        </div>
      </div>

          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClusteringMarkers customers={customers} userLocation={userLocation} showNearby={showNearby} onMarkerClick={handleMarkerClick} />
          <MapViewAdjuster showNearby={showNearby} userLocation={userLocation} />
          {userLocation && <UserLocationMarker userLocation={userLocation} />}
        </MapContainer>
  
        <div className='secondpart'>
          {selectedSeller && (
            <OutsidePopupComponent seller={selectedSeller} onClose={handleClosePopup} />
          )}
        </div>
      </div>
    );
  };
  
  export default MapComponent;
  