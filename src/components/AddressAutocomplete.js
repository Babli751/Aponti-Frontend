import { useState, useEffect, useRef } from 'react';
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
  const [isLoaded, setIsLoaded] = useState(false);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    // Wait for Google Maps to load
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        // Create a dummy div for PlacesService (it requires a DOM element)
        const dummyDiv = document.createElement('div');
        placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
        setIsLoaded(true);
        console.log('✅ Google Maps API loaded successfully');
      } else {
        // Check again after a delay
        setTimeout(checkGoogleMaps, 100);
      }
    };

    checkGoogleMaps();
  }, []);

  // Sync inputValue with external value prop
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);

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
    // Also call onChange for typing to save the input
    onChange(newInputValue);

    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchAddress(newInputValue);
    }, 500); // Wait 500ms after user stops typing
  };

  const handleChange = (event, newValue) => {
    console.log('🔄 AddressAutocomplete handleChange called:', newValue);

    if (newValue && newValue.placeId && placesService.current) {
      console.log('📍 Getting place details:', newValue.placeId);
      // Get detailed location data using PlacesService (no Geocoding API needed)
      placesService.current.getDetails(
        {
          placeId: newValue.placeId,
          fields: ['formatted_address', 'geometry', 'address_components', 'place_id']
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
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

            const locationData = {
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
            };

            console.log('✅ Place details retrieved:', locationData);

            // Set the full address
            onChange(place.formatted_address);

            // If callback provided, send location data
            if (onLocationSelect) {
              console.log('📤 Calling onLocationSelect callback');
              onLocationSelect(locationData);
            } else {
              console.warn('⚠️ onLocationSelect callback not provided!');
            }
          } else {
            console.error('❌ Place details failed:', status);
          }
        }
      );
    } else if (typeof newValue === 'string') {
      console.log('📝 String value entered (freeSolo):', newValue);
      onChange(newValue);
    } else {
      console.log('🗑️ Clearing value');
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
      disabled={!isLoaded}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={isLoaded ? placeholder : "Google Maps yükleniyor..."}
          required={required}
          slotProps={{
            input: {
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
            }
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
          ? "Google Maps yükleniyor..."
          : inputValue.length < 3
            ? "Aramak için en az 3 karakter yazın..."
            : loading
              ? "Aranıyor..."
              : "Adres bulunamadı"
      }
    />
  );
};

export default AddressAutocomplete;
