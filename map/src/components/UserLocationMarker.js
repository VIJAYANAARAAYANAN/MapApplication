import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import '../components/userlocationmarket.css'
const userIcon = L.icon({
  iconRetinaUrl: require('../assets/usermarket.png'),
  iconSize: [32, 41],
  iconAnchor: [12, 36],
  popupAnchor: [0, -36],
  className: 'user-location-marker'
});

const UserLocationMarker = ({ userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !userLocation) return;

    const userMarker = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
      .bindPopup('You are here')
      .addTo(map);

    return () => {
      map.removeLayer(userMarker);
    };
  }, [map, userLocation]);

  return null;
};

export default UserLocationMarker;
