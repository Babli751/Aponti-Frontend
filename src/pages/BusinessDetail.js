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
  IconButton,
  Chip,
  Divider,
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
  Facebook,
  Instagram,
  LocationOn,
  Phone,
  Email,
  Schedule,
  Person,
  CheckCircle,
  Favorite,
  ContentCut,
  Spa,
  FitnessCenter
} from '@mui/icons-material';

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const { isAuthenticated } = useAuth();

  const [business, setBusiness] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking dialog state
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Calendar state for Booksy-style booking
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState('Morning'); // Morning, Afternoon, Evening

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

        // Fetch business profile
        const businessResponse = await api.get(`/business/${id}`);
        setBusiness(businessResponse.data);

        // Fetch workers for this business
        try {
          const workersResponse = await api.get(`/business/${id}/workers`);
          console.log('Workers for business:', workersResponse.data);
          setWorkers(workersResponse.data || []);
        } catch (err) {
          console.error('Error fetching workers:', err);
          setWorkers([]);
        }

        // Fetch services for this business
        try {
          const servicesResponse = await api.get(`/business/${id}/services`);
          setServices(servicesResponse.data || []);
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
    setBookingDialogOpen(true);
    setBookingSuccess(false);
    setBookingError('');
    setSelectedWorker('');
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

      // Auto-select first available worker/barber for this service
      const serviceForWorker = selectedService.allServices?.[0] || selectedService;
      const barberId = serviceForWorker.barber_id || workers[0]?.id;

      const appointmentData = {
        service_id: serviceForWorker.id,
        barber_id: barberId,
        start_time: startTime
      };

      await api.post('/bookings/', appointmentData);

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingDialogOpen(false);
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Booking error:', err);
      setBookingError(err.response?.data?.detail || (
        language === 'en'
          ? 'Failed to create appointment'
          : language === 'tr'
          ? 'Randevu oluşturulamadı'
          : 'Не удалось создать запись'
      ));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !business) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Business not found'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
          {language === 'en' ? 'Back to Home' : language === 'tr' ? 'Ana Sayfaya Dön' : 'Вернуться на главную'}
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
        {/* Photo Gallery with Map/Contact on Right */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Left Side - Photos */}
          <Grid item xs={12} md={8}>
            {/* Main large photo */}
            <Box
              component="img"
              src={mainPhoto}
              alt="Business main"
              sx={{
                width: '100%',
                height: { xs: 250, md: 400 },
                objectFit: 'cover',
                borderRadius: 2,
                mb: 1
              }}
            />

            {/* Smaller thumbnail photos below */}
            <Box sx={{ display: 'flex', gap: 1, overflow: 'auto', mt: 1 }}>
              {galleryPhotos.slice(1).map((photo, index) => (
                <Box
                  key={index}
                  component="img"
                  src={photo}
                  alt={`Business photo ${index + 1}`}
                  onClick={() => setMainPhoto(photo)}
                  sx={{
                    width: 100,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: mainPhoto === photo ? '2px solid #2d3748' : '2px solid transparent',
                    transition: 'all 0.3s',
                    flexShrink: 0,
                    '&:hover': {
                      opacity: 0.8,
                      transform: 'scale(1.05)'
                    }
                  }}
                />
              ))}
            </Box>
          </Grid>

          {/* Right Side - Map and Contact */}
          <Grid item xs={12} md={4}>
            {/* Location Map */}
            <Box sx={{ mb: 2 }}>
              <Card sx={{ overflow: 'hidden', borderRadius: 2 }}>
                <MapView
                  businesses={[{
                    id: business.id,
                    name: business.business_name,
                    latitude: parseFloat(business.latitude || 41.0082),
                    longitude: parseFloat(business.longitude || 28.9784),
                    address: business.address || 'Test Street 123',
                    category: business.business_type
                  }]}
                  userLocation={null}
                  onBusinessClick={() => {}}
                  height="200px"
                />
              </Card>
            </Box>

            {/* Contact Info */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {language === 'en' ? 'Contact' : language === 'tr' ? 'İletişim' : 'Контакты'}
                </Typography>

                <Stack spacing={2}>
                  {/* Phone */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Phone sx={{ color: '#2d3748', fontSize: 20 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {business.phone || '+90 555 123 4567'}
                      </Typography>
                      <Button
                        size="small"
                        sx={{
                          mt: 0.5,
                          bgcolor: '#e8f5e9',
                          color: '#2d3748',
                          fontWeight: 600,
                          '&:hover': { bgcolor: '#c8e6c9' }
                        }}
                      >
                        {language === 'en' ? 'Call' : language === 'tr' ? 'Ara' : 'Позвонить'}
                      </Button>
                    </Box>
                  </Box>

                  {/* Address */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <LocationOn sx={{ color: '#2d3748', fontSize: 20, mt: 0.2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">
                        {business.address || 'Test Street 123'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {language === 'en' ? 'Contact & Business Hours' : language === 'tr' ? 'İletişim & Çalışma Saatleri' : 'Контакты и часы работы'}
                </Typography>

                <Stack spacing={1.5}>
                  {/* Monday to Friday */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {language === 'en' ? 'Today' : language === 'tr' ? 'Bugün' : 'Сегодня'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#00BFA6', fontWeight: 600 }}>
                      10:00 AM - 01:00 PM
                    </Typography>
                  </Box>

                  <Button
                    variant="text"
                    size="small"
                    sx={{ color: '#00BFA6', justifyContent: 'flex-start', pl: 0 }}
                  >
                    {language === 'en' ? 'Show full week' : language === 'tr' ? 'Tüm haftayı göster' : 'Показать всю неделю'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* About Us Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
            {language === 'en' ? 'About Us' : language === 'tr' ? 'Hakkımızda' : 'О нас'}
          </Typography>
          <Card>
            <CardContent>
              <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#4b5563' }}>
                {business.description || (language === 'en' ? 'Welcome to our business! We are dedicated to providing the highest quality services to our valued customers. With years of experience in the industry, our team of professionals is committed to ensuring your satisfaction.' : language === 'tr' ? 'İşletmemize hoş geldiniz! Değerli müşterilerimize en yüksek kalitede hizmet sunmaya dediktir. Sektördeki yılların tecrübesiyle, profesyonel ekibimiz memnuniyetinizi sağlamaya kararlıdır.' : 'Добро пожаловать в наш бизнес! Мы привержены предоставлению высочайшего качества услуг нашим ценным клиентам. С многолетним опытом работы в отрасли, наша команда профессионалов стремится обеспечить вашу удовлетворенность.')}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Services Section */}
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
          {language === 'en' ? 'Services' : language === 'tr' ? 'Hizmetler' : 'Услуги'}
        </Typography>

            {services.length === 0 ? (
              <Card>
                <CardContent>
                  <Typography color="text.secondary" textAlign="center">
                    {language === 'en' ? 'No services available' : language === 'tr' ? 'Henüz hizmet yok' : 'Услуги недоступны'}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {(() => {
                  // Group services by name
                  const groupedServices = services.reduce((acc, service) => {
                    if (!acc[service.name]) {
                      acc[service.name] = [];
                    }
                    acc[service.name].push(service);
                    return acc;
                  }, {});

                  return Object.entries(groupedServices).map(([serviceName, serviceGroup]) => {
                    const firstService = serviceGroup[0];
                    const serviceWorkers = serviceGroup
                      .map(s => workers.find(w => w.id === s.barber_id))
                      .filter(Boolean);

                    // Determine icon based on service name/category
                    const getCategoryIcon = () => {
                      const name = serviceName.toLowerCase();
                      const desc = (firstService.description || '').toLowerCase();
                      const text = name + ' ' + desc;

                      if (text.includes('hair') || text.includes('barber') || text.includes('cut') || text.includes('saç') || text.includes('kuaför') || text.includes('gttt')) {
                        return <ContentCut sx={{ fontSize: 28, color: '#2d3748' }} />;
                      } else if (text.includes('spa') || text.includes('massage') || text.includes('facial') || text.includes('beauty') || text.includes('güzellik')) {
                        return <Spa sx={{ fontSize: 28, color: '#2d3748' }} />;
                      } else if (text.includes('fitness') || text.includes('gym') || text.includes('workout') || text.includes('spor')) {
                        return <FitnessCenter sx={{ fontSize: 28, color: '#2d3748' }} />;
                      }
                      return <ContentCut sx={{ fontSize: 28, color: '#2d3748' }} />; // Default to barber icon
                    };

                    return (
                      <Grid item xs={12} key={serviceName}>
                        <Card sx={{
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                  {getCategoryIcon()}
                                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {serviceName}
                                  </Typography>
                                </Box>
                                {firstService.description && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {firstService.description}
                                  </Typography>
                                )}
                                <Stack direction="row" spacing={2} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                                  <Chip
                                    icon={<Schedule />}
                                    label={`${firstService.duration} ${language === 'en' ? 'min' : language === 'tr' ? 'dk' : 'мин'}`}
                                    size="small"
                                  />
                                  <Chip
                                    label={`€${firstService.price}`}
                                    size="small"
                                    color="primary"
                                    sx={{ fontWeight: 'bold' }}
                                  />
                                  {serviceWorkers.map((worker, idx) => (
                                    <Chip
                                      key={idx}
                                      icon={<Person />}
                                      label={worker.full_name || worker.email}
                                      size="small"
                                      sx={{ bgcolor: '#edf2f7', color: '#2d3748' }}
                                    />
                                  ))}
                                </Stack>
                              </Box>
                            <Stack direction="row" spacing={1}>
                              <Button
                                variant="outlined"
                                startIcon={<Favorite />}
                                sx={{
                                  borderColor: '#ff6b35',
                                  color: '#ff6b35',
                                  '&:hover': { borderColor: '#e55a2e', bgcolor: '#fff5f0' }
                                }}
                                onClick={() => {
                                  alert(language === 'en'
                                    ? 'Added to favorites!'
                                    : language === 'tr'
                                    ? 'Favorilere eklendi!'
                                    : 'Добавлено в избранное!');
                                }}
                              >
                                {language === 'en' ? 'Favorite' : language === 'tr' ? 'Favori' : 'В избранное'}
                              </Button>
                              <Button
                                variant="contained"
                                sx={{
                                  bgcolor: '#2d3748',
                                  '&:hover': { bgcolor: '#1a202c' }
                                }}
                                onClick={() => handleBooking({ ...firstService, workers: serviceWorkers, allServices: serviceGroup })}
                              >
                                {language === 'en' ? 'Book' : language === 'tr' ? 'Rezervasyon' : 'Забронировать'}
                              </Button>
                            </Stack>
                          </Box>
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
        onClose={() => setBookingDialogOpen(false)}
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
              {/* Month/Year Header */}
              <Box sx={{ px: 3, pt: 3, pb: 2, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {selectedMonth.toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })}
                </Typography>
              </Box>

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
                  {getTimeSlots().slice(0, 12).map((time, index) => (
                    <Button
                      key={index}
                      onClick={() => setSelectedTimeSlot(time)}
                      variant={selectedTimeSlot === time ? 'contained' : 'outlined'}
                      sx={{
                        minWidth: 100,
                        py: 1.5,
                        borderRadius: 2,
                        bgcolor: selectedTimeSlot === time ? '#00BFA6' : 'white',
                        color: selectedTimeSlot === time ? 'white' : '#2d3748',
                        borderColor: selectedTimeSlot === time ? '#00BFA6' : '#d1d5db',
                        fontWeight: 600,
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: selectedTimeSlot === time ? '#00A693' : '#f9fafb',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      {time}
                    </Button>
                  ))}
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
            onClick={() => setBookingDialogOpen(false)}
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
