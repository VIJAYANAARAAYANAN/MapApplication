import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet styles

const UserLocationMarker = ({ userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !userLocation) return;

    // Use Leaflet's default marker
    const userMarker = L.marker([userLocation.lat, userLocation.lon], {
      icon: L.divIcon({ 
        className: 'user-location-marker', 
        html: '<div style="background-color:#0861C5 ; width: 15px; height: 15px; border-radius: 50%;"></div>', 
        iconSize: [30, 30] 
      })
    })
    .bindPopup('You are here')
    .addTo(map);

    return () => {
      map.removeLayer(userMarker);
    };
  }, [map, userLocation]);

  return null;
};

export default UserLocationMarker;
