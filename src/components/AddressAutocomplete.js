import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';

const AddressAutocomplete = ({
  value,
  onChange,
  onLocationSelect,
  country = '',
  city = '',
  label,
  placeholder,
  required = false
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    // Clear options when country or city changes
    setOptions([]);
  }, [country, city]);

  const searchAddress = async (searchText) => {
    if (!searchText || searchText.length < 3) {
      setOptions([]);
      return;
    }

    setLoading(true);

    try {
      // Build search query with country and city context
      let query = searchText;
      if (city) query += `, ${city}`;
      if (country) {
        const countryName = typeof country === 'object' ? country.en : country;
        query += `, ${countryName}`;
      }

      // Use Nominatim API (OpenStreetMap's free geocoding service)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Booksy-App/1.0' // Required by Nominatim
        }
      });

      const data = await response.json();

      // Format results
      const formattedOptions = data.map((item) => ({
        label: item.display_name,
        address: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        street: item.address?.road || item.address?.street || '',
        house_number: item.address?.house_number || '',
        postcode: item.address?.postcode || '',
        suburb: item.address?.suburb || item.address?.neighbourhood || '',
        city: item.address?.city || item.address?.town || item.address?.village || '',
        country: item.address?.country || ''
      }));

      setOptions(formattedOptions);
    } catch (error) {
      console.error('Address search error:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);

    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchAddress(newInputValue);
    }, 500); // Wait 500ms after user stops typing
  };

  const handleChange = (event, newValue) => {
    if (newValue) {
      // User selected an address
      onChange(newValue.address);

      // If callback provided, send location data
      if (onLocationSelect) {
        onLocationSelect({
          address: newValue.address,
          latitude: newValue.lat,
          longitude: newValue.lon,
          street: newValue.street,
          house_number: newValue.house_number,
          postcode: newValue.postcode,
          suburb: newValue.suburb,
          city: newValue.city,
          country: newValue.country
        });
      }
    } else {
      onChange('');
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        return option.label || '';
      }}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <LocationOn sx={{ mr: 1, color: '#2d3748' }} />
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 1 }}>
          <LocationOn sx={{ color: '#EA4335', mt: 0.5, fontSize: 20 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {option.street && option.house_number
                ? `${option.street} ${option.house_number}`
                : option.street || option.suburb || 'Address'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              {option.city && option.country ? `${option.city}, ${option.country}` : option.label}
            </Typography>
          </Box>
        </Box>
      )}
      noOptionsText={
        inputValue.length < 3
          ? "Type at least 3 characters to search..."
          : loading
            ? "Searching..."
            : "No addresses found"
      }
    />
  );
};

export default AddressAutocomplete;
