import { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { LoadScript } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCYk2T45BQ5J2T07MiTiGaHMI2FBnRQVro';
const libraries = ['places'];

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
  const [isLoaded, setIsLoaded] = useState(false);
  const autocompleteService = useRef(null);
  const geocoder = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (window.google && window.google.maps) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      geocoder.current = new window.google.maps.Geocoder();
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Clear options when country or city changes
    setOptions([]);
  }, [country, city]);

  const searchAddress = async (searchText) => {
    if (!searchText || searchText.length < 3 || !autocompleteService.current) {
      setOptions([]);
      return;
    }

    setLoading(true);

    try {
      // Build search query with country and city context
      let searchQuery = searchText;
      if (city) searchQuery = `${searchText}, ${city}`;

      // Configure autocomplete request
      const request = {
        input: searchQuery,
        types: ['address'],
      };

      // Add country restriction if provided
      if (country) {
        const countryCode = typeof country === 'object' ? country.code : country;
        if (countryCode && countryCode.length === 2) {
          request.componentRestrictions = { country: countryCode.toLowerCase() };
        }
      }

      // Get predictions from Google Places API
      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const formattedOptions = predictions.map((prediction) => ({
            label: prediction.description,
            placeId: prediction.place_id,
            mainText: prediction.structured_formatting.main_text,
            secondaryText: prediction.structured_formatting.secondary_text,
          }));
          setOptions(formattedOptions);
        } else {
          setOptions([]);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Address search error:', error);
      setOptions([]);
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
    if (newValue && newValue.placeId && geocoder.current) {
      // Get detailed location data using Geocoder
      geocoder.current.geocode({ placeId: newValue.placeId }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const place = results[0];
          const addressComponents = {};

          // Parse address components
          place.address_components.forEach((component) => {
            const types = component.types;
            if (types.includes('street_number')) {
              addressComponents.house_number = component.long_name;
            }
            if (types.includes('route')) {
              addressComponents.street = component.long_name;
            }
            if (types.includes('locality')) {
              addressComponents.city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              addressComponents.state = component.long_name;
            }
            if (types.includes('country')) {
              addressComponents.country = component.long_name;
              addressComponents.country_code = component.short_name;
            }
            if (types.includes('postal_code')) {
              addressComponents.postcode = component.long_name;
            }
            if (types.includes('sublocality') || types.includes('neighborhood')) {
              addressComponents.suburb = component.long_name;
            }
          });

          // Set the full address
          onChange(place.formatted_address);

          // If callback provided, send location data
          if (onLocationSelect) {
            onLocationSelect({
              address: place.formatted_address,
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng(),
              street: addressComponents.street || '',
              house_number: addressComponents.house_number || '',
              postcode: addressComponents.postcode || '',
              suburb: addressComponents.suburb || '',
              city: addressComponents.city || '',
              state: addressComponents.state || '',
              country: addressComponents.country || '',
              country_code: addressComponents.country_code || '',
              place_id: newValue.placeId
            });
          }
        }
      });
    } else if (typeof newValue === 'string') {
      onChange(newValue);
    } else {
      onChange('');
    }
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
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
        disabled={!isLoaded}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={isLoaded ? placeholder : "Loading Google Maps..."}
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
                {option.mainText || option.label}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                {option.secondaryText || ''}
              </Typography>
            </Box>
          </Box>
        )}
        noOptionsText={
          !isLoaded
            ? "Loading Google Maps..."
            : inputValue.length < 3
              ? "Type at least 3 characters to search..."
              : loading
                ? "Searching..."
                : "No addresses found"
        }
      />
    </LoadScript>
  );
};

export default AddressAutocomplete;
