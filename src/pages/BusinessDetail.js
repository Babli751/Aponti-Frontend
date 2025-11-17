import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import MapView from '../components/MapView';
import api from '../services/api';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AppBar,
  Toolbar,
  FormControl,
  Select
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Phone,
  Schedule,
  Person,
  CheckCircle,
  Favorite,
  FavoriteBorder,
  ContentCut,
  Spa,
  FitnessCenter
} from '@mui/icons-material';

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [business, setBusiness] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking dialog state
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Favorite state - track which services are favorited
  const [favoritedServices, setFavoritedServices] = useState(new Set());

  // Calendar state for Booksy-style booking
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState('Morning'); // Morning, Afternoon, Evening
  const [bookedSlots, setBookedSlots] = useState([]); // Store booked time slots

  // Photo gallery state
  const galleryPhotos = [
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1200&q=80',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200&q=80',
    'https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=1200&q=80'
  ];
  const [mainPhoto, setMainPhoto] = useState(galleryPhotos[0]);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch business details
        try {
          const businessResponse = await api.get(`/businesses/${id}`);
          console.log('Business details:', businessResponse.data);
          setBusiness(businessResponse.data);
        } catch (err) {
          console.error('Error fetching business:', err);
          setBusiness(null);
        }

        // Fetch workers for this specific business
        try {
          const workersResponse = await api.get(`/businesses/${id}/workers`);
          console.log('Business workers:', workersResponse.data);
          const businessWorkers = Array.isArray(workersResponse.data) ? workersResponse.data : [];
          setWorkers(businessWorkers);
        } catch (err) {
          console.error('Error fetching workers:', err);
          setWorkers([]);
        }

        // Fetch services for this specific business
        try {
          const servicesResponse = await api.get(`/businesses/${id}/services`);
          console.log('Business services:', servicesResponse.data);
          const businessServices = Array.isArray(servicesResponse.data) ? servicesResponse.data : [];
          setServices(businessServices);

          // Fetch user's favorite services only if logged in
          if (isAuthenticated) {
            try {
              const favoritesResponse = await api.get('/users/favorites/services');
              console.log('User favorites:', favoritesResponse.data);
              const favoriteIds = new Set(favoritesResponse.data.map(fav => fav.service_id || fav.id));
              setFavoritedServices(favoriteIds);
            } catch (err) {
              console.error('Error fetching favorites:', err);
              setFavoritedServices(new Set());
            }
          } else {
            setFavoritedServices(new Set());
          }
        } catch (err) {
          console.error('Error fetching services:', err);
          setServices([]);
        }

      } catch (err) {
        console.error('Error fetching business data:', err);
        setError(language === 'en'
          ? 'Failed to load business details'
          : language === 'tr'
          ? 'İşletme detayları yüklenemedi'
          : 'Не удалось загрузить детали бизнеса'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBusinessData();
    }
  }, [id, language]);

  // Fetch booked slots when day or worker changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDayOfWeek || !selectedWorker) {
        setBookedSlots([]);
        return;
      }

      try {
        const dateStr = selectedDayOfWeek.toISOString().split('T')[0]; // YYYY-MM-DD format
        const response = await api.get(`/bookings/worker/${selectedWorker.id}/date/${dateStr}`);

        // Extract booked time slots - mark ALL 15-min slots between start and end as booked
        const booked = [];
        response.data.forEach(booking => {
          const startTime = new Date(booking.start_time);
          const endTime = new Date(booking.end_time);

          // Generate all 15-minute slots between start and end
          let currentTime = new Date(startTime);
          while (currentTime < endTime) {
            const hours = currentTime.getHours();
            const minutes = currentTime.getMinutes();
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
            const displayMinutes = minutes.toString().padStart(2, '0');
            booked.push(`${displayHours}:${displayMinutes} ${period}`);

            // Move to next 15-minute slot
            currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
          }
        });

        console.log('📅 Booked slots for', dateStr, ':', booked);
        setBookedSlots(booked);
      } catch (err) {
        console.error('Error fetching booked slots:', err);
        setBookedSlots([]);
      }
    };

    fetchBookedSlots();
  }, [selectedDayOfWeek, selectedWorker]);

  // Helper functions for calendar
  const getNextWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getTimeSlots = () => {
    const slots = [];
    if (timeOfDay === 'Morning') {
      for (let hour = 9; hour <= 11; hour++) {
        for (let min = 0; min < 60; min += 15) {
          slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} AM`);
        }
      }
    } else if (timeOfDay === 'Afternoon') {
      for (let hour = 12; hour <= 17; hour++) {
        for (let min = 0; min < 60; min += 15) {
          const displayHour = hour > 12 ? hour - 12 : hour;
          slots.push(`${displayHour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} PM`);
        }
      }
    } else { // Evening
      for (let hour = 18; hour <= 21; hour++) {
        for (let min = 0; min < 60; min += 15) {
          slots.push(`${(hour - 12).toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} PM`);
        }
      }
    }
    return slots;
  };

  const handleBooking = (service) => {
    // Open booking dialog instead of navigating
    setSelectedService(service);
    // Set first worker as default
    const firstWorker = service.workers?.[0] || workers[0];
    setSelectedWorker(firstWorker);
    setBookingDialogOpen(true);
    setBookingSuccess(false);
    setSelectedDayOfWeek(null);
    setSelectedTimeSlot(null);
    setTimeOfDay('Morning');
  };

  const handleSubmitBooking = async () => {
    try {
      setBookingError('');

      if (!selectedDayOfWeek || !selectedTimeSlot) {
        setBookingError(language === 'en'
          ? 'Please select a day and time'
          : language === 'tr'
          ? 'Lütfen bir gün ve saat seçin'
          : 'Пожалуйста, выберите день и время'
        );
        return;
      }

      // Format the date from selectedDayOfWeek
      const year = selectedDayOfWeek.getFullYear();
      const month = String(selectedDayOfWeek.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDayOfWeek.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Convert time slot to 24-hour format
      const timeStr = selectedTimeSlot.replace(' AM', '').replace(' PM', '');
      const [hours, minutes] = timeStr.split(':');
      let hour24 = parseInt(hours);
      if (selectedTimeSlot.includes('PM') && hour24 !== 12) {
        hour24 += 12;
      } else if (selectedTimeSlot.includes('AM') && hour24 === 12) {
        hour24 = 0;
      }
      const formattedTime = `${String(hour24).padStart(2, '0')}:${minutes}`;

      // Combine date and time into ISO format
      const startTime = `${dateStr}T${formattedTime}:00`;

      // Use selected worker
      const serviceForWorker = selectedService.allServices?.[0] || selectedService;
      const barberId = selectedWorker?.id || serviceForWorker.barber_id || workers[0]?.id;

      // Don't create booking yet - only create after payment
      // Store booking data to create after payment
      const bookingData = {
        service_id: serviceForWorker.id,
        barber_id: barberId,
        start_time: startTime
      };

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingDialogOpen(false);
        // Redirect to payment page with booking data (not created yet)
        navigate('/payment', {
          state: {
            bookingData: bookingData, // Send data to create booking after payment
            servicePrice: serviceForWorker.price || 0,
            serviceName: serviceForWorker.name || selectedService.name,
            workerName: selectedWorker?.full_name || selectedWorker?.name || 'Unknown',
            businessName: business?.business_name || business?.name || 'Unknown Business',
            businessId: business?.id
          }
        });
      }, 1500);

    } catch (err) {
      console.error('Booking error:', err);

      // Check if error is about already booked slot - don't show error since we already disabled those slots
      const errorDetail = err.response?.data?.detail || '';
      if (errorDetail.toLowerCase().includes('already booked') ||
          errorDetail.toLowerCase().includes('time slot')) {
        // Slot is already booked - silently refresh booked slots
        const dateStr = selectedDayOfWeek.toISOString().split('T')[0];
        try {
          const response = await api.get(`/bookings/worker/${selectedWorker.id}/date/${dateStr}`);
          const booked = [];
          response.data.forEach(booking => {
            const startTime = new Date(booking.start_time);
            const endTime = new Date(booking.end_time);

            let currentTime = new Date(startTime);
            while (currentTime < endTime) {
              const hours = currentTime.getHours();
              const minutes = currentTime.getMinutes();
              const period = hours >= 12 ? 'PM' : 'AM';
              const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
              const displayMinutes = minutes.toString().padStart(2, '0');
              booked.push(`${displayHours}:${displayMinutes} ${period}`);
              currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
            }
          });
          setBookedSlots(booked);
          // Clear selected time slot since it's now booked
          setSelectedTimeSlot(null);
        } catch (refreshErr) {
          console.error('Error refreshing booked slots:', refreshErr);
        }
        return;
      }

      // Show other errors
      setBookingError(err.response?.data?.detail || (
        language === 'en'
          ? 'Failed to create appointment'
          : language === 'tr'
          ? 'Randevu oluşturulamadı'
          : 'Не удалось создать запись'
      ));
    }
  };

  // Test data for when API fails
  const testBusinessData = {
    id: 1,
    business_name: 'Premium Barbershop',
    address: '123 Main Street, Istanbul',
    phone: '+90 555 123 4567',
    latitude: 41.0082,
    longitude: 28.9784,
    business_type: 'Barbershop',
    description: 'Professional barbershop with experienced barbers'
  };

  const testServicesData = [
    {
      id: 1,
      name: 'Haircut',
      description: 'Professional men\'s haircut',
      price: 25,
      duration: 30,
      barber_id: 1
    },
    {
      id: 2,
      name: 'Beard Trim',
      description: 'Professional beard trimming and shaping',
      price: 15,
      duration: 15,
      barber_id: 1
    },
    {
      id: 3,
      name: 'Haircut + Beard',
      description: 'Complete grooming package',
      price: 35,
      duration: 45,
      barber_id: 1
    }
  ];

  const testWorkersData = [
    {
      id: 1,
      full_name: 'John Barber',
      email: 'john@barbershop.com'
    },
    {
      id: 2,
      full_name: 'Mike Expert',
      email: 'mike@barbershop.com'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show only real data - no mock fallback
  const displayBusiness = business || null;
  const displayServices = services || [];
  const displayWorkers = workers || [];
  const showTestDataBanner = false; // Removed test data banner

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Test Data Banner */}
      {showTestDataBanner && (
        <Alert severity="warning" sx={{ m: 2, mb: 0 }}>
          <Typography variant="body2">
            ⚠️ {language === 'en'
              ? 'Displaying test data (API unavailable)'
              : language === 'tr'
              ? 'Test verileri gösteriliyor (API kullanılamıyor)'
              : 'Отображаются тестовые данные (API недоступен)'
            }
          </Typography>
        </Alert>
      )}

      {/* Header with Logo and Language Selector */}
      <AppBar position="sticky" elevation={0} sx={{
        background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
        borderBottom: '1px solid #1a202c'
      }}>
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <Box sx={{ flexGrow: 1 }}>
            <Logo size="small" variant="white" onClick={() => navigate('/')} />
          </Box>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                '& .MuiSvgIcon-root': { color: 'white' }
              }}
            >
              <MenuItem value="en">🇬🇧 English</MenuItem>
              <MenuItem value="tr">🇹🇷 Türkçe</MenuItem>
              <MenuItem value="ru">🇷🇺 Русский</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 6 }}>
        {/* Photo Gallery with Map/Contact/About on Right */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {/* Left Side - Photos */}
          <Grid item xs={12} md={7}>
            {/* Main large photo */}
            <Box
              component="img"
              src={mainPhoto}
              alt="Business main"
              sx={{
                width: '100%',
                height: { xs: 320, sm: 380, md: 480 },
                objectFit: 'cover',
                borderRadius: 2,
                mb: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            />

            {/* Larger thumbnail photos below */}
            <Box sx={{ display: 'flex', gap: 1.5, overflow: 'auto', scrollBehavior: 'smooth', pb: 1 }}>
              {galleryPhotos.map((photo, index) => (
                <Box
                  key={index}
                  component="img"
                  src={photo}
                  alt={`Business photo ${index + 1}`}
                  onClick={() => setMainPhoto(photo)}
                  sx={{
                    width: 130,
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    border: mainPhoto === photo ? '3px solid #2d3748' : '2px solid #e5e7eb',
                    transition: 'all 0.3s ease-in-out',
                    flexShrink: 0,
                    '&:hover': {
                      opacity: 0.85,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                />
              ))}
            </Box>
          </Grid>

          {/* Right Side - Map, About Us, Contact */}
          <Grid item xs={12} md={5}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              {/* Location Map */}
              {displayBusiness && (
                <Card sx={{ overflow: 'hidden', borderRadius: 2, position: 'relative' }}>
                  <MapView
                    businesses={[{
                      id: displayBusiness.id,
                      name: displayBusiness.business_name,
                      latitude: parseFloat(displayBusiness.latitude || 41.0082),
                      longitude: parseFloat(displayBusiness.longitude || 28.9784),
                      address: displayBusiness.address || 'Test Street 123',
                      category: displayBusiness.business_type
                    }]}
                    userLocation={null}
                    onBusinessClick={() => {}}
                    height="250px"
                />
                <Chip
                  label={language === 'en' ? '1 businesses nearby' : language === 'tr' ? '1 işletme yakında' : '1 предприятие рядом'}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: 'white',
                    boxShadow: 2,
                    fontWeight: 600
                  }}
                />
              </Card>
              )}

              {/* About Us Card */}
              {displayBusiness && (
                <Card sx={{ flex: 1 }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                      {language === 'en' ? 'About Us' : language === 'tr' ? 'Hakkımızda' : 'О нас'}
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, color: '#4b5563', flex: 1 }}>
                      {displayBusiness.description || (language === 'en' ? 'Welcome to our business! We are dedicated to providing the highest quality services.' : language === 'tr' ? 'İşletmemize hoş geldiniz! En yüksek kalitede hizmet sunmaya dediktir.' : 'Добро пожаловать в наш бизнес!')}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Contact Info Card */}
              {displayBusiness && (
                <Card>
                  <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {language === 'en' ? 'Contact & Hours' : language === 'tr' ? 'İletişim & Saatler' : 'Контакты'}
                    </Typography>
                    <Chip
                      label={`${displayWorkers.length} ${language === 'en' ? 'workers' : language === 'tr' ? 'çalışan' : 'работников'}`}
                      size="small"
                      sx={{ bgcolor: '#e5e7eb', color: '#2d3748', fontWeight: 600 }}
                    />
                  </Box>

                  <Stack spacing={1.5}>
                    {/* Phone */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Phone sx={{ color: '#2d3748', fontSize: 18 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                          {displayBusiness.phone || '+90 555 123 4567'}
                        </Typography>
                        <Button
                          size="small"
                          sx={{
                            mt: 0.3,
                            bgcolor: '#e8f5e9',
                            color: '#2d3748',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            py: 0.3,
                            px: 1,
                            '&:hover': { bgcolor: '#c8e6c9' }
                          }}
                        >
                          {language === 'en' ? 'Call' : language === 'tr' ? 'Ara' : 'Позвонить'}
                        </Button>
                      </Box>
                    </Box>

                    {/* Address */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <LocationOn sx={{ color: '#2d3748', fontSize: 18, mt: 0.2, flexShrink: 0 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                          {displayBusiness.address || 'Test Street 123'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Business Hours */}
                    <Box sx={{ pt: 1, borderTop: '1px solid #e5e7eb' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                          {language === 'en' ? 'Today' : language === 'tr' ? 'Bugün' : 'Сегодня'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#00BFA6', fontWeight: 600, fontSize: '0.9rem' }}>
                          10:00 AM - 01:00 PM
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Services Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {language === 'en' ? 'Services' : language === 'tr' ? 'Hizmetler' : 'Услуги'}
          </Typography>
          <Chip
            label={`${displayServices.length} ${language === 'en' ? 'services' : language === 'tr' ? 'hizmet' : 'услуг'}`}
            sx={{ bgcolor: '#00BFA6', color: 'white', fontWeight: 600 }}
          />
        </Box>

            {displayServices.length === 0 ? (
              <Card>
                <CardContent>
                  <Typography color="text.secondary" textAlign="center">
                    {language === 'en' ? 'No services available' : language === 'tr' ? 'Henüz hizmet yok' : 'Услуги недос���упны'}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {(() => {
                  // Group services by name
                  const groupedServices = displayServices.reduce((acc, service) => {
                    if (!acc[service.name]) {
                      acc[service.name] = [];
                    }
                    acc[service.name].push(service);
                    return acc;
                  }, {});

                  return Object.entries(groupedServices).map(([serviceName, serviceGroup]) => {
                    const firstService = serviceGroup[0];
                    const serviceWorkers = serviceGroup
                      .map(s => displayWorkers.find(w => w.id === s.barber_id))
                      .filter(Boolean);

                    const getCategoryIcon = () => {
                      const name = serviceName.toLowerCase();
                      const desc = (firstService.description || '').toLowerCase();
                      const text = name + ' ' + desc;

                      if (text.includes('hair') || text.includes('barber') || text.includes('cut') || text.includes('saç') || text.includes('kuaför') || text.includes('gttt')) {
                        return <ContentCut sx={{ fontSize: 32, color: 'white' }} />;
                      } else if (text.includes('spa') || text.includes('massage') || text.includes('facial') || text.includes('beauty') || text.includes('güzellik')) {
                        return <Spa sx={{ fontSize: 32, color: 'white' }} />;
                      } else if (text.includes('fitness') || text.includes('gym') || text.includes('workout') || text.includes('spor')) {
                        return <FitnessCenter sx={{ fontSize: 32, color: 'white' }} />;
                      }
                      return <ContentCut sx={{ fontSize: 32, color: 'white' }} />;
                    };

                    return (
                      <Grid item xs={12} sm={6} md={4} key={serviceName}>
                        <Card sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          borderRadius: 2.5,
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 20px 32px rgba(0, 0, 0, 0.15)'
                          }
                        }}>
                          <Box sx={{
                            background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
                            p: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 100
                          }}>
                            {getCategoryIcon()}
                          </Box>

                          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1f2937' }}>
                              {serviceName}
                            </Typography>

                            {firstService.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1, lineHeight: 1.5 }}>
                                {firstService.description}
                              </Typography>
                            )}

                            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'baseline' }}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                  {language === 'en' ? 'Price' : language === 'tr' ? 'Fiyat' : 'Цена'}
                                </Typography>
                                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#00BFA6' }}>
                                  €{firstService.price}
                                </Typography>
                              </Box>
                              <Box sx={{ borderLeft: '1px solid #e5e7eb', pl: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                  {language === 'en' ? 'Duration' : language === 'tr' ? 'Süre' : 'Длительность'}
                                </Typography>
                                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#4a5568' }}>
                                  {firstService.duration}m
                                </Typography>
                              </Box>
                            </Box>

                            {serviceWorkers.length > 0 && (
                              <Box sx={{ mb: 2, pb: 2, borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', display: 'block', mb: 1 }}>
                                  {language === 'en' ? 'Available with' : language === 'tr' ? 'Kullanılabilir' : 'Доступно'}:
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.8 }}>
                                  {serviceWorkers.map((worker, idx) => (
                                    <Chip
                                      key={idx}
                                      icon={<Person />}
                                      label={worker.full_name || worker.email}
                                      size="small"
                                      sx={{
                                        bgcolor: '#edf2f7',
                                        color: '#2d3748',
                                        fontWeight: 500
                                      }}
                                    />
                                  ))}
                                </Stack>
                              </Box>
                            )}

                            <Stack direction="row" spacing={1.5} sx={{ mt: 'auto' }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={favoritedServices.has(firstService.id) ? <Favorite /> : <FavoriteBorder />}
                                fullWidth
                                sx={{
                                  borderColor: favoritedServices.has(firstService.id) ? '#ff6b35' : '#d1d5db',
                                  color: favoritedServices.has(firstService.id) ? '#ff6b35' : '#6b7280',
                                  fontWeight: 600,
                                  '&:hover': {
                                    borderColor: '#ff6b35',
                                    bgcolor: '#fff5f0',
                                    color: '#ff6b35'
                                  }
                                }}
                                onClick={async () => {
                                  // Check if user is logged in
                                  if (!isAuthenticated) {
                                    // Redirect to login
                                    navigate('/signin', { state: { from: `/business/${id}` } });
                                    return;
                                  }

                                  // Toggle favorite
                                  const serviceId = firstService.id;

                                  if (!serviceId) {
                                    return;
                                  }

                                  try {
                                    if (favoritedServices.has(serviceId)) {
                                      // Remove from favorites
                                      await api.delete(`/users/favorites/services/${serviceId}`);
                                      setFavoritedServices(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(serviceId);
                                        return newSet;
                                      });
                                    } else {
                                      // Add to favorites
                                      await api.post(`/users/favorites/services/${serviceId}`);
                                      setFavoritedServices(prev => new Set(prev).add(serviceId));
                                    }
                                  } catch (error) {
                                    console.error('Error toggling favorite:', error);
                                  }
                                }}
                              >
                                {language === 'en' ? 'Save' : language === 'tr' ? 'Kaydet' : 'Сохранить'}
                              </Button>
                              <Button
                                variant="contained"
                                size="small"
                                fullWidth
                                sx={{
                                  bgcolor: '#00BFA6',
                                  color: 'white',
                                  fontWeight: 600,
                                  '&:hover': {
                                    bgcolor: '#00A693'
                                  }
                                }}
                                onClick={() => handleBooking({ ...firstService, workers: serviceWorkers, allServices: serviceGroup })}
                              >
                                {language === 'en' ? 'Book' : language === 'tr' ? 'Rezerv' : 'Забронировать'}
                              </Button>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  });
                })()}
              </Grid>
            )}

            {/* Reviews Section - Booksy Style */}
            <Box sx={{ mt: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {language === 'en' ? 'Reviews' : language === 'tr' ? 'Yorumlar' : 'Отзывы'}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setReviewDialogOpen(true)}
                  sx={{
                    bgcolor: '#2d3748',
                    '&:hover': { bgcolor: '#1a202c' }
                  }}
                >
                  {language === 'en' ? 'Write a Review' : language === 'tr' ? 'Yorum Yaz' : 'Написать отзыв'}
                </Button>
              </Box>

              <Stack spacing={3}>
                {/* Sample Reviews */}
                {[
                  { name: 'John Doe', rating: 5, date: '2 days ago', text: language === 'en' ? 'Excellent service! The barber was very professional and the atmosphere was great.' : language === 'tr' ? 'Mükemmel hizmet! Berber çok profesyoneldi ve atmosfer harikaydı.' : 'Отличный сервис!' },
                  { name: 'Jane Smith', rating: 5, date: '1 week ago', text: language === 'en' ? 'Best haircut I\'ve had in years. Highly recommend!' : language === 'tr' ? 'Yıllardır aldığım en iyi saç kesimi. Kesinlikle tavsiye ederim!' : 'Лучшая стрижка!' },
                  { name: 'Mike Johnson', rating: 4, date: '2 weeks ago', text: language === 'en' ? 'Good service, friendly staff. Will come back again.' : language === 'tr' ? 'İyi hizmet, güler yüzlü personel. Tekrar geleceğim.' : 'Хороший сервис!' }
                ].map((review, index) => (
                  <Card key={index}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#2d3748', width: 48, height: 48 }}>
                            {review.name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                              {review.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, my: 0.5 }}>
                              {[...Array(5)].map((_, i) => (
                                <Box key={i} sx={{ color: i < review.rating ? '#fbbf24' : '#d1d5db', fontSize: '1.2rem' }}>
                                  ★
                                </Box>
                              ))}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {review.date}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Typography variant="body1" sx={{ color: '#4b5563' }}>
                        {review.text}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
      </Container>

      {/* Booking Dialog - Booksy Style */}
      <Dialog
        open={bookingDialogOpen}
        onClose={() => {
          setBookingDialogOpen(false);
          setBookingError('');
          setBookingSuccess(false);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: '#3b4554',
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          py: 2.5,
          px: 3
        }}>
          {language === 'en' ? 'Book an Appointment' : language === 'tr' ? 'Randevu Oluştur' : 'Забронировать'}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {bookingSuccess ? (
            <Alert severity="success" sx={{ m: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle />
                <Typography>
                  {language === 'en'
                    ? 'Appointment booked successfully!'
                    : language === 'tr'
                    ? 'Randevu başarıyla alındı!'
                    : 'Запись успешно забронирована!'}
                </Typography>
              </Box>
            </Alert>
          ) : (
            <Box>
              {/* Error Alert */}
              {bookingError && (
                <Alert severity="error" sx={{ m: 3 }} onClose={() => setBookingError('')}>
                  <Typography>{bookingError}</Typography>
                </Alert>
              )}
              {/* Month/Year Header */}
              <Box sx={{ px: 3, pt: 3, pb: 2, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {selectedMonth.toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })}
                </Typography>
              </Box>

              {/* Worker Selection */}
              {selectedService?.workers && selectedService.workers.length > 0 && (
                <Box sx={{ px: 3, pb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#4b5563' }}>
                    {language === 'en' ? 'Select Worker' : language === 'tr' ? 'Çalışan Seçin' : 'Выберите работника'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {selectedService.workers.map((worker) => (
                      <Box
                        key={worker.id}
                        onClick={() => setSelectedWorker(worker)}
                        sx={{
                          flex: '0 0 auto',
                          minWidth: 120,
                          py: 1.5,
                          px: 2,
                          textAlign: 'center',
                          borderRadius: 2,
                          cursor: 'pointer',
                          bgcolor: selectedWorker?.id === worker.id ? '#00BFA6' : 'white',
                          color: selectedWorker?.id === worker.id ? 'white' : 'inherit',
                          border: '1px solid',
                          borderColor: selectedWorker?.id === worker.id ? '#00BFA6' : '#e5e7eb',
                          '&:hover': {
                            bgcolor: selectedWorker?.id === worker.id ? '#00A693' : '#f9fafb'
                          }
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {worker.full_name || `${worker.first_name || ''} ${worker.last_name || ''}`.trim() || 'Worker'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Week Days Selector */}
              <Box sx={{ px: 2, pb: 2, overflow: 'auto' }}>
                <Box sx={{ display: 'flex', gap: 1.5, minWidth: 'max-content', px: 1 }}>
                  {getNextWeekDays().map((day, index) => (
                    <Box
                      key={index}
                      onClick={() => setSelectedDayOfWeek(day)}
                      sx={{
                        minWidth: 80,
                        py: 2,
                        px: 1.5,
                        textAlign: 'center',
                        borderRadius: 2,
                        cursor: 'pointer',
                        bgcolor: selectedDayOfWeek?.getDate() === day.getDate() ? '#00BFA6' : 'white',
                        color: selectedDayOfWeek?.getDate() === day.getDate() ? 'white' : 'inherit',
                        border: '1px solid',
                        borderColor: selectedDayOfWeek?.getDate() === day.getDate() ? '#00BFA6' : '#e5e7eb',
                        '&:hover': {
                          bgcolor: selectedDayOfWeek?.getDate() === day.getDate() ? '#00A693' : '#f9fafb'
                        }
                      }}
                    >
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                        {day.getDate()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Time of Day Tabs - Always visible */}
              <Box sx={{ px: 3, py: 2, borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  {['Morning', 'Afternoon', 'Evening'].map((period) => (
                    <Button
                      key={period}
                      onClick={() => setTimeOfDay(period)}
                      variant={timeOfDay === period ? 'contained' : 'outlined'}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1,
                        bgcolor: timeOfDay === period ? 'white' : 'transparent',
                        color: timeOfDay === period ? '#2d3748' : '#6b7280',
                        borderColor: timeOfDay === period ? '#2d3748' : '#d1d5db',
                        fontWeight: 600,
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: timeOfDay === period ? 'white' : '#f9fafb',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      {period}
                    </Button>
                  ))}
                </Box>
              </Box>

              {/* Time Slots - Always visible, no scrolling */}
              <Box sx={{ px: 3, py: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {getTimeSlots().slice(0, 12).map((time, index) => {
                    const isBooked = bookedSlots.includes(time);
                    return (
                      <Button
                        key={index}
                        onClick={() => !isBooked && setSelectedTimeSlot(time)}
                        variant={selectedTimeSlot === time ? 'contained' : 'outlined'}
                        disabled={isBooked}
                        sx={{
                          minWidth: 100,
                          py: 1.5,
                          borderRadius: 2,
                          bgcolor: isBooked ? '#f3f4f6' : selectedTimeSlot === time ? '#00BFA6' : 'white',
                          color: isBooked ? '#9ca3af' : selectedTimeSlot === time ? 'white' : '#2d3748',
                          borderColor: isBooked ? '#e5e7eb' : selectedTimeSlot === time ? '#00BFA6' : '#d1d5db',
                          fontWeight: 600,
                          boxShadow: 'none',
                          textDecoration: isBooked ? 'line-through' : 'none',
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          '&:hover': {
                            bgcolor: isBooked ? '#f3f4f6' : selectedTimeSlot === time ? '#00A693' : '#f9fafb',
                            boxShadow: 'none'
                          },
                          '&.Mui-disabled': {
                            bgcolor: '#f3f4f6',
                            color: '#9ca3af',
                            borderColor: '#e5e7eb'
                          }
                        }}
                      >
                        {time}
                      </Button>
                    );
                  })}
                </Box>
              </Box>

              {/* Booking Summary */}
              {selectedTimeSlot && (
                <Box sx={{ px: 3, py: 3, bgcolor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {selectedService?.name || 'Service'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedDayOfWeek?.toLocaleDateString()} • {selectedTimeSlot}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total:</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        ${selectedService?.price || '100.00'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedService?.duration || '45'}min
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 3, bgcolor: '#f9fafb', gap: 2 }}>
          <Button
            onClick={() => {
              setBookingDialogOpen(false);
              setBookingError('');
              setBookingSuccess(false);
            }}
            variant="outlined"
            fullWidth
            sx={{
              borderColor: '#d1d5db',
              color: '#4b5563',
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': {
                borderColor: '#9ca3af',
                bgcolor: 'transparent'
              }
            }}
          >
            {language === 'en' ? 'Cancel' : language === 'tr' ? 'İptal' : 'Отмена'}
          </Button>
          {!bookingSuccess && (
            <Button
              onClick={handleSubmitBooking}
              variant="contained"
              fullWidth
              disabled={!selectedDayOfWeek || !selectedTimeSlot}
              sx={{
                bgcolor: '#00BFA6',
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0, 191, 166, 0.2)',
                '&:hover': {
                  bgcolor: '#00A693',
                  boxShadow: '0 4px 8px rgba(0, 191, 166, 0.3)'
                },
                '&.Mui-disabled': {
                  bgcolor: '#d1d5db',
                  color: '#9ca3af'
                }
              }}
            >
              {language === 'en' ? 'Continue' : language === 'tr' ? 'Devam Et' : 'Продолжить'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {language === 'en' ? 'Write a Review' : language === 'tr' ? 'Yorum Yaz' : 'Написать отзыв'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              {language === 'en' ? 'Rating' : language === 'tr' ? 'Değerlendirme' : 'Рейтинг'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Box
                  key={star}
                  onClick={() => setReviewRating(star)}
                  sx={{
                    fontSize: '2rem',
                    cursor: 'pointer',
                    color: star <= reviewRating ? '#fbbf24' : '#d1d5db',
                    '&:hover': { color: '#fbbf24' }
                  }}
                >
                  ★
                </Box>
              ))}
            </Box>

            <TextField
              label={language === 'en' ? 'Your Review' : language === 'tr' ? 'Yorumunuz' : 'Ваш отзыв'}
              multiline
              rows={4}
              fullWidth
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={language === 'en'
                ? 'Share your experience with this business...'
                : language === 'tr'
                ? 'Bu işletme hakkındaki deneyiminizi paylaşın...'
                : 'Поделитесь своим опытом...'}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>
            {language === 'en' ? 'Cancel' : language === 'tr' ? 'İptal' : 'Отмена'}
          </Button>
          <Button
            onClick={() => {
              // TODO: Submit review to API
              alert(language === 'en' ? 'Review submitted!' : language === 'tr' ? 'Yorum gönderildi!' : 'Отзыв отправлен!');
              setReviewDialogOpen(false);
              setReviewText('');
              setReviewRating(5);
            }}
            variant="contained"
            sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#1a202c' } }}
            disabled={!reviewText.trim()}
          >
            {language === 'en' ? 'Submit Review' : language === 'tr' ? 'Gönder' : 'Отправить'}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
};

export default BusinessDetail;
