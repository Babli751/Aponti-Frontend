import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Box, CircularProgress } from '@mui/material';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCYk2T45BQ5J2T07MiTiGaHMI2FBnRQVro';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 41.0082,  // Istanbul
  lng: 28.9784
};

const MapView = ({ businesses, userLocation, onBusinessClick, height = '500px' }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [center] = useState(defaultCenter);
  const [zoom] = useState(12);

  useEffect(() => {
    if (map && userLocation) {
      // When user location changes, pan and zoom to it
      map.panTo({ lat: userLocation.lat, lng: userLocation.lng || userLocation.lon });
      map.setZoom(14);
      console.log('📍 Map zoomed to user location:', userLocation);
    }
  }, [userLocation, map]);

  useEffect(() => {
    // When businesses change, fit bounds to show all
    if (map && businesses && businesses.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();

      businesses.forEach(business => {
        if (business.latitude && business.longitude) {
          bounds.extend({
            lat: business.latitude,
            lng: business.longitude
          });
        }
      });

      // Only fit bounds if we have valid businesses
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
        console.log('🗺️ Map fitted to businesses bounds');
      }
    }
  }, [businesses, map]);

  const onLoad = useCallback(function callback(map) {
    setMap(map);

    // Fit bounds to show all markers
    if (businesses && businesses.length > 0) {
      console.log('🗺️ MapView onLoad - businesses:', businesses);
      const bounds = new window.google.maps.LatLngBounds();

      if (userLocation) {
        console.log('📍 MapView - User location:', userLocation);
        bounds.extend({
          lat: userLocation.lat,
          lng: userLocation.lng || userLocation.lon
        });
      }

      businesses.forEach(business => {
        console.log('🏢 MapView - Business location:', {
          name: business.name || business.business_name,
          lat: business.latitude,
          lng: business.longitude
        });
        if (business.latitude && business.longitude) {
          bounds.extend({
            lat: business.latitude,
            lng: business.longitude
          });
        }
      });

      map.fitBounds(bounds);
    }
  }, [businesses, userLocation]);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  if (loadError) {
    return (
      <Box sx={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Error loading maps
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box sx={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height, width: '100%', position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* User location marker (blue) */}
        {userLocation && (
          <Marker
            position={{
              lat: userLocation.lat,
              lng: userLocation.lng || userLocation.lon
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
            title="Your Location"
          />
        )}

        {/* Business markers (red) */}
        {businesses && businesses.map((business) => {
          if (!business.latitude || !business.longitude) return null;

          return (
            <Marker
              key={business.id}
              position={{
                lat: business.latitude,
                lng: business.longitude
              }}
              onClick={() => {
                setSelectedBusiness(business);
                if (onBusinessClick) {
                  onBusinessClick(business.id);
                }
              }}
              icon={{
                url: 'data:image/svg+xml;base64,' + btoa(`
                  <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 20.313 12.5 28.5 0-8.187 12.5-19.125 12.5-28.5C25 5.596 19.404 0 12.5 0z" fill="#EA4335"/>
                    <circle cx="12.5" cy="12.5" r="5" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(25, 41),
                anchor: new window.google.maps.Point(12, 41)
              }}
              title={business.name || business.business_name}
            />
          );
        })}

        {/* Info Window for selected business */}
        {selectedBusiness && (
          <InfoWindow
            position={{
              lat: selectedBusiness.latitude,
              lng: selectedBusiness.longitude
            }}
            onCloseClick={() => setSelectedBusiness(null)}
          >
            <div style={{ minWidth: '200px', padding: '8px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '16px' }}>
                {selectedBusiness.name || selectedBusiness.business_name}
              </h3>
              {selectedBusiness.address && (
                <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                  📍 {selectedBusiness.address}
                </p>
              )}
              {selectedBusiness.city && (
                <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                  🏙️ {selectedBusiness.city}
                </p>
              )}
              {selectedBusiness.category && (
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  <strong>Category:</strong> {selectedBusiness.category}
                </p>
              )}
              <button
                onClick={() => {
                  window.location.href = `/business/${selectedBusiness.id}`;
                }}
                style={{
                  marginTop: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#EA4335',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  width: '100%'
                }}
              >
                View Details
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </Box>
  );
};

export default MapView;
