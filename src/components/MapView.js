import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Alert, Chip } from '@mui/material';
import { LocationOn } from '@mui/icons-material';

const MapView = ({ businesses, userLocation, onBusinessClick, height = '500px' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      try {
        if (!window.L) {
          // Dynamically import Leaflet
          const L = await import('leaflet');
          window.L = L.default || L;
        }

        initializeMap();
      } catch (err) {
        console.error('Error loading Leaflet:', err);
        setError('Failed to load map');
        setLoading(false);
      }
    };

    loadLeaflet();

    return () => {
      // Cleanup map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && businesses) {
      updateMarkers();
    }
  }, [businesses, userLocation]);

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = window.L;

    // Default center (will be updated when user location is available)
    const center = userLocation
      ? [userLocation.lat, userLocation.lon]
      : [41.3275, 69.2781]; // Default to Tashkent

    // Create map
    const map = L.map(mapRef.current).setView(center, 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;
    setLoading(false);

    // Add user location marker if available
    if (userLocation) {
      const userIcon = L.divIcon({
        html: `<div style="
          background-color: #4285F4;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
        "></div>`,
        className: 'user-location-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>Your Location</b>');
    }

    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !businesses) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add business markers
    businesses.forEach(business => {
      if (business.latitude && business.longitude) {
        // Create custom icon
        const businessIcon = L.divIcon({
          html: `<div style="
            background-color: #2d3748;
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <span style="transform: rotate(45deg); font-size: 16px;">📍</span>
          </div>`,
          className: 'business-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30]
        });

        const marker = L.marker([business.latitude, business.longitude], { icon: businessIcon })
          .addTo(map);

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #2d3748; font-size: 16px;">${business.name}</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #666;">${business.address || ''}</p>
            ${business.category ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Category:</strong> ${business.category}</p>` : ''}
            ${business.distance ? `<p style="margin: 4px 0; font-size: 12px; color: #2d3748;"><strong>${business.distance} km away</strong></p>` : ''}
            <button
              onclick="window.handleBusinessClick(${business.id})"
              style="
                margin-top: 8px;
                padding: 6px 12px;
                background-color: #2d3748;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
              "
            >
              View Details
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        // Add click handler
        marker.on('click', () => {
          if (onBusinessClick) {
            onBusinessClick(business);
          }
        });

        markersRef.current.push(marker);
      }
    });

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  };

  // Expose click handler to window for popup buttons
  useEffect(() => {
    window.handleBusinessClick = (businessId) => {
      const business = businesses.find(b => b.id === businessId);
      if (business && onBusinessClick) {
        onBusinessClick(business);
      }
    };

    return () => {
      delete window.handleBusinessClick;
    };
  }, [businesses, onBusinessClick]);

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ position: 'relative', height, width: '100%' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.8)',
            zIndex: 1000
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <Box
        ref={mapRef}
        sx={{
          height: '100%',
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          '& .leaflet-container': {
            height: '100%',
            width: '100%',
            zIndex: 1
          }
        }}
      />

      {businesses && businesses.length > 0 && (
        <Chip
          icon={<LocationOn />}
          label={`${businesses.length} businesses nearby`}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            bgcolor: 'white',
            boxShadow: 2,
            zIndex: 1000
          }}
        />
      )}
    </Box>
  );
};

export default MapView;
