import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box } from '@mui/material';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom red marker icon for businesses
const redIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 20.313 12.5 28.5 0-8.187 12.5-19.125 12.5-28.5C25 5.596 19.404 0 12.5 0z" fill="#EA4335"/>
      <circle cx="12.5" cy="12.5" r="5" fill="white"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Blue marker icon for user location
const blueIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="#4285F4" stroke="white" stroke-width="3"/>
    </svg>
  `),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Component to handle map updates
function MapUpdater({ businesses, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      // Zoom to user location
      map.setView([userLocation.lat, userLocation.lng || userLocation.lon], 13);
    } else if (businesses && businesses.length > 0) {
      // Fit bounds to show all businesses
      const bounds = businesses
        .filter(b => b.latitude && b.longitude)
        .map(b => [b.latitude, b.longitude]);

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, businesses, userLocation]);

  return null;
}

const MapView = ({ businesses, userLocation, onBusinessClick, height = '500px' }) => {
  const mapRef = useRef(null);

  return (
    <Box sx={{ height, width: '100%', position: 'relative' }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
          minZoom={2}
        />

        <MapUpdater businesses={businesses} userLocation={userLocation} />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng || userLocation.lon]}
            icon={blueIcon}
          >
            <Popup>
              <strong>Your Location</strong>
            </Popup>
          </Marker>
        )}

        {/* Business markers */}
        {businesses && businesses.map((business) => {
          if (!business.latitude || !business.longitude) return null;

          return (
            <Marker
              key={business.id}
              position={[business.latitude, business.longitude]}
              icon={redIcon}
              eventHandlers={{
                click: () => {
                  if (onBusinessClick) {
                    onBusinessClick(business.id);
                  }
                }
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '16px' }}>
                    {business.name || business.business_name}
                  </h3>
                  {business.address && (
                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                      {business.address}
                    </p>
                  )}
                  {business.city && (
                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                      {business.city}
                    </p>
                  )}
                  {business.category && (
                    <p style={{ margin: '4px 0', fontSize: '12px' }}>
                      <strong>Category:</strong> {business.category}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      window.location.href = `/business/${business.id}`;
                    }}
                    style={{
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#EA4335',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
};

export default MapView;
