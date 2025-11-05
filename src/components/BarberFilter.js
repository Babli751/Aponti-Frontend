import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Box,
  Drawer,
  Typography,
  Button,
  Slider,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Chip,
  Divider,
  IconButton,
  Rating,
  TextField,
  Autocomplete,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close,
  FilterList,
  Star,
  LocationOn,
  AccessTime,
  EuroSymbol,
  Verified,
  Schedule,
  TrendingUp
} from '@mui/icons-material';

const BarberFilter = ({ open, onClose, onApply, currentFilters = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { language, t: translations } = useLanguage();

  // Filter translations
  const t = {
    ...translations,
    filterTitle: language === 'en' ? 'Filter Barbers' : language === 'tr' ? 'Berberleri Filtrele' : 'Фильтровать парикмахеров',
    clearAll: language === 'en' ? 'Clear All' : language === 'tr' ? 'Tümünü Temizle' : 'Очистить все',
    applyFilters: language === 'en' ? 'Apply Filters' : language === 'tr' ? 'Filtreleri Uygula' : 'Применить фильтры',
    location: language === 'en' ? 'Location' : language === 'tr' ? 'Konum' : 'Местоположение',
    priceRange: language === 'en' ? 'Price Range' : language === 'tr' ? 'Fiyat Aralığı' : 'Диапазон цен',
    rating: language === 'en' ? 'Minimum Rating' : language === 'tr' ? 'Minimum Puan' : 'Минимальный рейтинг',
    distance: language === 'en' ? 'Distance' : language === 'tr' ? 'Mesafe' : 'Расстояние',
    availability: language === 'en' ? 'Availability' : language === 'tr' ? 'Müsaitlik' : 'Доступность',
    services: language === 'en' ? 'Services' : language === 'tr' ? 'Hizmetler' : 'Услуги',
    features: language === 'en' ? 'Features' : language === 'tr' ? 'Özellikler' : 'Особенности',
    sortBy: language === 'en' ? 'Sort By' : language === 'tr' ? 'Sırala' : 'Сортировать по',
    distance_km: language === 'en' ? 'km' : language === 'tr' ? 'km' : 'км',
    today: language === 'en' ? 'Available Today' : language === 'tr' ? 'Bugün Müsait' : 'Доступен сегодня',
    tomorrow: language === 'en' ? 'Available Tomorrow' : language === 'tr' ? 'Yarın Müsait' : 'Доступен завтра',
    thisWeek: language === 'en' ? 'Available This Week' : language === 'tr' ? 'Bu Hafta Müsait' : 'Доступен на этой неделе',
    instantBooking: language === 'en' ? 'Instant Booking' : language === 'tr' ? 'Anında Rezervasyon' : 'Мгновенное бронирование',
    verifiedOnly: language === 'en' ? 'Verified Only' : language === 'tr' ? 'Sadece Doğrulanmış' : 'Только проверенные',
    newBarbers: language === 'en' ? 'New Barbers' : language === 'tr' ? 'Yeni Berberler' : 'Новые парикмахеры',
    topRated: language === 'en' ? 'Top Rated' : language === 'tr' ? 'En Yüksek Puanlı' : 'Лучшие оценки',
    mostBooked: language === 'en' ? 'Most Booked' : language === 'tr' ? 'En Çok Rezerve Edilen' : 'Самые популярные',
    lowToHigh: language === 'en' ? 'Price: Low to High' : language === 'tr' ? 'Fiyat: Düşükten Yükseğe' : 'Цена: по возрастанию',
    highToLow: language === 'en' ? 'Price: High to Low' : language === 'tr' ? 'Fiyat: Yüksekten Düşüğe' : 'Цена: по убыванию',
    filterResults: language === 'en' ? 'results found' : language === 'tr' ? 'sonuç bulundu' : 'результатов найдено'
  };

  // European cities
  const europeanCities = [
    'Berlin, Germany', 'Paris, France', 'Madrid, Spain', 'Rome, Italy',
    'Amsterdam, Netherlands', 'Vienna, Austria', 'Brussels, Belgium',
    'Prague, Czech Republic', 'Budapest, Hungary', 'Warsaw, Poland',
    'Stockholm, Sweden', 'Copenhagen, Denmark', 'Oslo, Norway',
    'Helsinki, Finland', 'Dublin, Ireland', 'Lisbon, Portugal',
    'Athens, Greece', 'Zurich, Switzerland', 'Luxembourg City, Luxembourg'
  ];

  const serviceTypes = language === 'en' ? [
    'Haircut', 'Beard Trim', 'Shave', 'Hair Wash', 'Styling', 'Color', 'Treatment'
  ] : language === 'tr' ? [
    'Saç Kesimi', 'Sakal Düzeltme', 'Tıraş', 'Saç Yıkama', 'Şekillendirme', 'Boyama', 'Bakım'
  ] : [
    'Стрижка', 'Стрижка бороды', 'Бритье', 'Мытье волос', 'Укладка', 'Окрашивание', 'Уход'
  ];

  const featureTypes = language === 'en' ? [
    'WiFi', 'Air Conditioning', 'Parking', 'Card Payment', 'Wheelchair Accessible'
  ] : language === 'tr' ? [
    'WiFi', 'Klima', 'Otopark', 'Kart Ödeme', 'Tekerlekli Sandalye Erişimi'
  ] : [
    'WiFi', 'Кондиционер', 'Парковка', 'Оплата картой', 'Доступ для инвалидных колясок'
  ];

  const [filters, setFilters] = useState({
    location: currentFilters.location || '',
    priceRange: currentFilters.priceRange || [0, 100],
    rating: currentFilters.rating || 0,
    distance: currentFilters.distance || 10,
    availability: currentFilters.availability || [],
    services: currentFilters.services || [],
    features: currentFilters.features || [],
    sortBy: currentFilters.sortBy || 'nearest',
    verifiedOnly: currentFilters.verifiedOnly || false,
    instantBooking: currentFilters.instantBooking || false
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleArrayFilterChange = (filterType, value, checked) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked 
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      priceRange: [0, 100],
      rating: 0,
      distance: 10,
      availability: [],
      services: [],
      features: [],
      sortBy: 'nearest',
      verifiedOnly: false,
      instantBooking: false
    });
  };

  const applyFilters = () => {
    onApply(filters);
    if (isMobile) {
      onClose();
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100) count++;
    if (filters.rating > 0) count++;
    if (filters.distance < 10) count++;
    if (filters.availability.length > 0) count++;
    if (filters.services.length > 0) count++;
    if (filters.features.length > 0) count++;
    if (filters.verifiedOnly) count++;
    if (filters.instantBooking) count++;
    return count;
  };

  const FilterContent = () => (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
          {t.filterTitle}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={clearFilters}
            sx={{ color: '#6b7280', borderColor: '#d1d5db' }}
          >
            {t.clearAll}
          </Button>
          {isMobile && (
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Location Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
          <LocationOn sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
          {t.location}
        </Typography>
        <Autocomplete
          value={filters.location}
          onChange={(event, newValue) => handleFilterChange('location', newValue || '')}
          options={europeanCities}
          renderInput={(params) => (
            <TextField {...params} placeholder="Select city..." size="small" />
          )}
          size="small"
        />
      </Box>

      {/* Price Range */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
          <EuroSymbol sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
          {t.priceRange}
        </Typography>
        <Box sx={{ px: 1 }}>
          <Slider
            value={filters.priceRange}
            onChange={(event, newValue) => handleFilterChange('priceRange', newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            step={5}
            sx={{ color: '#2d3748' }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">€{filters.priceRange[0]}</Typography>
            <Typography variant="body2" color="text.secondary">€{filters.priceRange[1]}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Rating Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
          <Star sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
          {t.rating}
        </Typography>
        <Rating
          value={filters.rating}
          onChange={(event, newValue) => handleFilterChange('rating', newValue || 0)}
          size="large"
          sx={{ color: '#fbbf24' }}
        />
      </Box>

      {/* Distance Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
          <LocationOn sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
          {t.distance}: {filters.distance} {t.distance_km}
        </Typography>
        <Box sx={{ px: 1 }}>
          <Slider
            value={filters.distance}
            onChange={(event, newValue) => handleFilterChange('distance', newValue)}
            min={1}
            max={20}
            step={1}
            sx={{ color: '#2d3748' }}
          />
        </Box>
      </Box>

      {/* Availability Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
          <Schedule sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
          {t.availability}
        </Typography>
        <Stack direction="column" spacing={1}>
          {[
            { value: 'today', label: t.today },
            { value: 'tomorrow', label: t.tomorrow },
            { value: 'thisWeek', label: t.thisWeek }
          ].map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={filters.availability.includes(option.value)}
                  onChange={(e) => handleArrayFilterChange('availability', option.value, e.target.checked)}
                  sx={{ color: '#2d3748' }}
                />
              }
              label={option.label}
            />
          ))}
        </Stack>
      </Box>

      {/* Services Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
          {t.services}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {serviceTypes.map((service) => (
            <Chip
              key={service}
              label={service}
              variant={filters.services.includes(service) ? 'filled' : 'outlined'}
              onClick={() => handleArrayFilterChange('services', service, !filters.services.includes(service))}
              sx={{
                bgcolor: filters.services.includes(service) ? '#2d3748' : 'transparent',
                color: filters.services.includes(service) ? 'white' : '#1f2937',
                borderColor: '#2d3748'
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Features Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
          {t.features}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {featureTypes.map((feature) => (
            <Chip
              key={feature}
              label={feature}
              variant={filters.features.includes(feature) ? 'filled' : 'outlined'}
              onClick={() => handleArrayFilterChange('features', feature, !filters.features.includes(feature))}
              sx={{
                bgcolor: filters.features.includes(feature) ? '#2d3748' : 'transparent',
                color: filters.features.includes(feature) ? 'white' : '#1f2937',
                borderColor: '#2d3748'
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Additional Options */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
          Additional Options
        </Typography>
        <Stack direction="column" spacing={1}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.verifiedOnly}
                onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                sx={{ color: '#2d3748' }}
              />
            }
            label={t.verifiedOnly}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.instantBooking}
                onChange={(e) => handleFilterChange('instantBooking', e.target.checked)}
                sx={{ color: '#2d3748' }}
              />
            }
            label={t.instantBooking}
          />
        </Stack>
      </Box>

      {/* Sort Options */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}>
          {t.sortBy}
        </Typography>
        <RadioGroup
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <FormControlLabel value="nearest" control={<Radio sx={{ color: '#2d3748' }} />} label={t.nearest} />
          <FormControlLabel value="topRated" control={<Radio sx={{ color: '#2d3748' }} />} label={t.topRated} />
          <FormControlLabel value="mostBooked" control={<Radio sx={{ color: '#2d3748' }} />} label={t.mostBooked} />
          <FormControlLabel value="lowToHigh" control={<Radio sx={{ color: '#2d3748' }} />} label={t.lowToHigh} />
          <FormControlLabel value="highToLow" control={<Radio sx={{ color: '#2d3748' }} />} label={t.highToLow} />
        </RadioGroup>
      </Box>

      {/* Apply Button */}
      <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'white', pt: 2, borderTop: '1px solid #e5e7eb' }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={applyFilters}
          sx={{
            bgcolor: '#2d3748',
            fontWeight: 'bold',
            '&:hover': { bgcolor: '#007562' }
          }}
        >
          {t.applyFilters} {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
        </Button>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            height: '90vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16
          }
        }}
      >
        <FilterContent />
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 350 }
      }}
    >
      <FilterContent />
    </Drawer>
  );
};

export default BarberFilter;
