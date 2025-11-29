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
  Select,
  Modal,
  IconButton
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
  FitnessCenter,
  Close
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
  const [reviews, setReviews] = useState([]);

  // Favorite state - track which services are favorited
  const [favoritedServices, setFavoritedServices] = useState(new Set());

  // Calendar state for Booksy-style booking
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState('Morning'); // Morning, Afternoon, Evening
  const [bookedSlots, setBookedSlots] = useState([]); // Store booked time slots
  const [workerHours, setWorkerHours] = useState([]); // Worker's working hours

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

        // Fetch reviews for this business
        try {
          const reviewsResponse = await api.get(`/reviews/business/${id}`);
          console.log('Business reviews:', reviewsResponse.data);
          setReviews(Array.isArray(reviewsResponse.data) ? reviewsResponse.data : []);
        } catch (err) {
          console.error('Error fetching reviews:', err);
          setReviews([]);
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

        // Extract booked time slots - only mark the START time as booked
        const booked = [];
        response.data.forEach(booking => {
          const startTime = new Date(booking.start_time);

          // Only mark the start time slot as booked
          const hours = startTime.getHours();
          const minutes = startTime.getMinutes();
          const period = hours >= 12 ? 'PM' : 'AM';
          const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
          const displayMinutes = minutes.toString().padStart(2, '0');
          booked.push(`${displayHours}:${displayMinutes} ${period}`);
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
      // 9:00 AM - 12:45 PM (4 hours = 16 slots)
      for (let hour = 9; hour <= 12; hour++) {
        for (let min = 0; min < 60; min += 15) {
          if (hour === 12) {
            slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} PM`);
          } else {
            slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} AM`);
          }
        }
      }
    } else if (timeOfDay === 'Afternoon') {
      // 1:00 PM - 4:45 PM (4 hours = 16 slots)
      for (let hour = 13; hour <= 16; hour++) {
        for (let min = 0; min < 60; min += 15) {
          const displayHour = hour - 12;
          slots.push(`${displayHour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} PM`);
        }
      }
    } else { // Evening
      // 5:00 PM - 8:45 PM (4 hours = 16 slots)
      for (let hour = 17; hour <= 20; hour++) {
        for (let min = 0; min < 60; min += 15) {
          const displayHour = hour - 12;
          slots.push(`${displayHour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} PM`);
        }
      }
    }
    return slots;
  };

  // Fetch worker hours when worker is selected
  const fetchWorkerHours = async (workerId) => {
    try {
      const response = await api.get(`/businesses/public/workers/${workerId}/hours`);
      setWorkerHours(response.data || []);
    } catch (err) {
      console.error('Failed to fetch worker hours:', err);
      setWorkerHours([]);
    }
  };

  // Check if a time slot is within worker's working hours
  const isSlotWithinWorkerHours = (timeSlot) => {
    if (!selectedWorker || !selectedDayOfWeek || workerHours.length === 0) {
      return true; // If no worker selected or no hours set, allow all slots
    }

    // Get day of week (0=Monday in our system, but JS Date uses 0=Sunday)
    const jsDay = selectedDayOfWeek.getDay();
    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // Convert to 0=Monday format

    // Find worker's hours for this day
    const dayHours = workerHours.find(h => h.day_of_week === dayOfWeek);

    if (!dayHours || !dayHours.is_working) {
      return false; // Worker doesn't work this day
    }

    // Convert time slot to 24-hour format for comparison
    const timeStr = timeSlot.replace(' AM', '').replace(' PM', '');
    const [hours, minutes] = timeStr.split(':');
    let hour24 = parseInt(hours);

    if (timeSlot.includes('PM') && hour24 !== 12) {
      hour24 += 12;
    } else if (timeSlot.includes('AM') && hour24 === 12) {
      hour24 = 0;
    }

    const slotTime = hour24 * 60 + parseInt(minutes);

    // Parse worker's start and end times
    const [startH, startM] = dayHours.start_time.split(':');
    const [endH, endM] = dayHours.end_time.split(':');
    const startTime = parseInt(startH) * 60 + parseInt(startM);
    const endTime = parseInt(endH) * 60 + parseInt(endM);

    return slotTime >= startTime && slotTime < endTime;
  };

  // Handle worker selection
  const handleWorkerSelect = (worker) => {
    setSelectedWorker(worker);
    fetchWorkerHours(worker.id);
  };

  const handleBooking = (service) => {
    // Open booking dialog instead of navigating
    setSelectedService(service);
    // Don't auto-select worker - let user choose
    setSelectedWorker(null);
    setWorkerHours([]); // Reset worker hours
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
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          mb: 6
        }}>
          {/* Left Side - Photos */}
          <Box sx={{ flex: { xs: '1', md: '0 0 58%' } }}>
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
          </Box>

          {/* Right Side - Map, About Us, Contact */}
          <Box sx={{ flex: { xs: '1', md: '0 0 38%' } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
              {/* Location Map */}
              {displayBusiness && (
                <Card sx={{ overflow: 'hidden', borderRadius: 2, position: 'relative', flexShrink: 0 }}>
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
                    height="200px"
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
                <Card sx={{ flexShrink: 0 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                      {language === 'en' ? 'About Us' : language === 'tr' ? 'Hakkımızda' : 'О нас'}
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, color: '#4b5563' }}>
                      {displayBusiness.description || (language === 'en' ? 'Welcome to our business! We are dedicated to providing the highest quality services.' : language === 'tr' ? 'İşletmemize hoş geldiniz! En yüksek kalitede hizmet sunmaya dediktir.' : 'Добро пожаловать в наш бизнес!')}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Contact Info Card */}
              {displayBusiness && (
                <Card sx={{ flexShrink: 0 }}>
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
            </Box>
          </Box>
        </Box>

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
                {/* Real Reviews from API */}
                {reviews.length === 0 ? (
                  <Card>
                    <CardContent>
                      <Typography variant="body1" sx={{ color: '#6b7280', textAlign: 'center', py: 2 }}>
                        {language === 'en' ? 'No reviews yet. Be the first to review!' : language === 'tr' ? 'Henüz yorum yok. İlk yorumu siz yapın!' : 'Пока нет отзывов'}
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Avatar
                              src={review.user_avatar}
                              sx={{ bgcolor: '#2d3748', width: 48, height: 48 }}
                            >
                              {review.user_name[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                {review.user_name}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, my: 0.5 }}>
                                {[...Array(5)].map((_, i) => (
                                  <Box key={i} sx={{ color: i < review.rating ? '#fbbf24' : '#d1d5db', fontSize: '1.2rem' }}>
                                    ★
                                  </Box>
                                ))}
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(review.created_at).toLocaleDateString(
                                  language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US',
                                  { year: 'numeric', month: 'long', day: 'numeric' }
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        {review.comment && (
                          <Typography variant="body1" sx={{ color: '#4b5563' }}>
                            {review.comment}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
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

              {/* Worker Selection - Always show available workers */}
              {workers && workers.length > 0 && (
                <Box sx={{ px: 3, pb: 2, borderBottom: '1px solid #e5e7eb' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#4b5563' }}>
                    {language === 'en' ? 'Select Worker' : language === 'tr' ? 'Çalışan Seçin' : 'Выберите работника'}
                    <Typography component="span" sx={{ color: '#ef4444', ml: 0.5 }}>*</Typography>
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1.5 }}>
                    {workers.map((worker) => (
                      <Box
                        key={worker.id}
                        onClick={() => handleWorkerSelect(worker)}
                        sx={{
                          py: 2,
                          px: 2,
                          textAlign: 'center',
                          borderRadius: 2,
                          cursor: 'pointer',
                          bgcolor: selectedWorker?.id === worker.id ? '#00BFA6' : 'white',
                          color: selectedWorker?.id === worker.id ? 'white' : 'inherit',
                          border: '2px solid',
                          borderColor: selectedWorker?.id === worker.id ? '#00BFA6' : '#e5e7eb',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: selectedWorker?.id === worker.id ? '#00A693' : '#f9fafb',
                            borderColor: selectedWorker?.id === worker.id ? '#00A693' : '#00BFA6',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {worker.full_name || `${worker.first_name || ''} ${worker.last_name || ''}`.trim() || 'Worker'}
                        </Typography>
                        {selectedWorker?.id === worker.id && (
                          <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.9 }}>
                            ✓ {language === 'en' ? 'Selected' : language === 'tr' ? 'Seçildi' : 'Выбрано'}
                          </Typography>
                        )}
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

              {/* Time Slots - Show all available slots */}
              <Box sx={{ px: 3, py: 3, maxHeight: '300px', overflowY: 'auto' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {getTimeSlots().map((time, index) => {
                    const isBooked = bookedSlots.includes(time);
                    const isOutsideWorkerHours = !isSlotWithinWorkerHours(time);
                    const isDisabled = isBooked || isOutsideWorkerHours;
                    return (
                      <Button
                        key={index}
                        onClick={() => !isDisabled && setSelectedTimeSlot(time)}
                        variant={selectedTimeSlot === time ? 'contained' : 'outlined'}
                        disabled={isDisabled}
                        sx={{
                          minWidth: 100,
                          py: 1.5,
                          borderRadius: 2,
                          bgcolor: isDisabled ? '#fee2e2' : selectedTimeSlot === time ? '#00BFA6' : 'white',
                          color: isDisabled ? '#dc2626' : selectedTimeSlot === time ? 'white' : '#2d3748',
                          borderColor: isDisabled ? '#fecaca' : selectedTimeSlot === time ? '#00BFA6' : '#d1d5db',
                          fontWeight: 600,
                          boxShadow: 'none',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          '&:hover': {
                            bgcolor: isDisabled ? '#fee2e2' : selectedTimeSlot === time ? '#00A693' : '#f9fafb',
                            boxShadow: 'none'
                          },
                          '&.Mui-disabled': {
                            bgcolor: '#fee2e2',
                            color: '#dc2626',
                            borderColor: '#fecaca'
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
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {selectedDayOfWeek?.toLocaleDateString()} • {selectedTimeSlot}
                  </Typography>
                  {selectedWorker && (
                    <Typography variant="body2" sx={{ color: '#00BFA6', fontWeight: 500 }}>
                      👤 {selectedWorker.full_name || selectedWorker.name || 'Worker'}
                    </Typography>
                  )}
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

      {/* Review Modal - Custom overlay without MUI Modal to avoid aria-hidden issues */}
      {reviewDialogOpen && (
        <Box
          onClick={() => setReviewDialogOpen(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'relative',
              width: '90%',
              maxWidth: '600px',
              bgcolor: 'white',
              borderRadius: '8px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              outline: 'none',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            {/* Header */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid #e5e7eb'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000' }}>
                {language === 'en' ? 'Write a Review' : language === 'tr' ? 'Yorum Yaz' : 'Написать отзыв'}
              </Typography>
              <IconButton
                onClick={() => setReviewDialogOpen(false)}
                sx={{ color: '#666' }}
              >
                <Close />
              </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#000' }}>
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
                      '&:hover': { color: '#fbbf24' },
                      userSelect: 'none'
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
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: 'white',
                    color: '#000'
                  },
                  '& .MuiInputLabel-root': {
                    color: '#666'
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#d1d5db'
                    }
                  }
                }}
              />
            </Box>

            {/* Actions */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              p: 2,
              borderTop: '1px solid #e5e7eb'
            }}>
              <Button onClick={() => setReviewDialogOpen(false)}>
                {language === 'en' ? 'Cancel' : language === 'tr' ? 'İptal' : 'Отмена'}
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (!isAuthenticated) {
                      alert(language === 'en' ? 'Please sign in to submit a review' : language === 'tr' ? 'Yorum yapmak için giriş yapın' : 'Войдите, чтобы оставить отзыв');
                      return;
                    }

                    await api.post('/reviews/', {
                      business_id: parseInt(id),
                      rating: reviewRating,
                      comment: reviewText.trim()
                    });

                    // Refresh reviews after submission
                    const reviewsResponse = await api.get(`/reviews/business/${id}`);
                    setReviews(Array.isArray(reviewsResponse.data) ? reviewsResponse.data : []);

                    alert(language === 'en' ? 'Review submitted successfully!' : language === 'tr' ? 'Yorum başarıyla gönderildi!' : 'Отзыв отправлен!');
                    setReviewDialogOpen(false);
                    setReviewText('');
                    setReviewRating(5);
                  } catch (error) {
                    console.error('Error submitting review:', error);
                    alert(language === 'en' ? 'Failed to submit review' : language === 'tr' ? 'Yorum gönderilemedi' : 'Не удалось отправить отзыв');
                  }
                }}
                variant="contained"
                sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#1a202c' } }}
                disabled={!reviewText.trim()}
              >
                {language === 'en' ? 'Submit Review' : language === 'tr' ? 'Gönder' : 'Отправить'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <Footer />
    </Box>
  );
};

export default BusinessDetail;
