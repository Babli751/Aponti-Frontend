import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Logo from '../components/Logo';
import PaymentDialog from '../components/PaymentDialog';
import api from '../services/api';
import {
  Box, Container, Typography, TextField, Button, MenuItem, FormControl,
  Select, InputLabel, Card, CardContent, Grid, Alert, AppBar, Toolbar,
  IconButton, Stack, Divider, Link
} from '@mui/material';
import {
  ArrowBack, Business, LocationOn, ContentCut, Person, CalendarToday,
  AccessTime, CheckCircle, Speed, Security, Phone, Email, Facebook,
  Instagram, Twitter, Language as LanguageIcon
} from '@mui/icons-material';

const AppointmentNew = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Get current date formatted
  const getCurrentDateFormatted = () => {
    const now = new Date();
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    const locale = language === 'en' ? 'en-US' : language === 'tr' ? 'tr-TR' : 'ru-RU';
    return now.toLocaleDateString(locale, options);
  };

  // States
  const [category, setCategory] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [currentDate, setCurrentDate] = useState(getCurrentDateFormatted());
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Fetch all businesses initially
  const [allBusinesses, setAllBusinesses] = useState([]);

  useEffect(() => {
    const fetchAllBusinesses = async () => {
      try {
        const response = await api.get('/business/');
        setAllBusinesses(response.data || []);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      }
    };
    fetchAllBusinesses();
  }, []);

  // Check URL parameters for pre-selected business/service
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const businessParam = urlParams.get('business');
    const serviceParam = urlParams.get('service');
    const workerParam = urlParams.get('worker');

    console.log('URL Params:', { businessParam, serviceParam, workerParam });

    if (businessParam) {
      setSelectedBusinessId(businessParam);
      console.log('Pre-selected business:', businessParam);
    }

    if (serviceParam) {
      setSelectedServiceId(serviceParam);
      console.log('Pre-selected service:', serviceParam);
    }

    if (workerParam) {
      setSelectedWorkerId(workerParam);
      console.log('Pre-selected worker:', workerParam);
    }
  }, []);

  // Update date daily at midnight
  useEffect(() => {
    const updateDate = () => {
      setCurrentDate(getCurrentDateFormatted());
    };

    // Update immediately
    updateDate();

    // Calculate time until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    // Set timeout to update at midnight, then update daily
    const midnightTimeout = setTimeout(() => {
      updateDate();
      // Set interval to update daily after first midnight update
      const dailyInterval = setInterval(updateDate, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, [language]); // Re-run when language changes

  // Filter businesses by category
  useEffect(() => {
    if (category) {
      const filtered = allBusinesses.filter(b => b.category === category);
      setBusinesses(filtered);
      setSelectedBusinessId('');
      setServices([]);
      setSelectedServiceId('');
      setWorkers([]);
      setSelectedWorkerId('');
    }
  }, [category, allBusinesses]);

  // Fetch services and workers when business is selected
  useEffect(() => {
    const fetchServicesAndWorkers = async () => {
      if (selectedBusinessId) {
        try {
          // Fetch services
          const servicesResponse = await api.get(`/business/${selectedBusinessId}/services`);
          setServices(servicesResponse.data || []);
          setSelectedServiceId('');

          // Fetch business details to get workers
          const businessResponse = await api.get(`/business/${selectedBusinessId}`);
          const businessData = businessResponse.data;

          // Fetch workers for this business
          try {
            const workersResponse = await api.get(`/business/${selectedBusinessId}/workers`);
            console.log('Workers for business:', workersResponse.data);
            setWorkers(workersResponse.data || []);
          } catch (workerError) {
            console.error('Error fetching workers:', workerError);
            setWorkers([]);
          }
          setSelectedWorkerId('');
        } catch (error) {
          console.error('Error fetching services/workers:', error);
          setServices([]);
          setWorkers([]);
        }
      }
    };
    fetchServicesAndWorkers();
  }, [selectedBusinessId]);

  // Auto-select worker when service is selected
  useEffect(() => {
    if (selectedServiceId && services.length > 0) {
      const selectedService = services.find(s => s.id === parseInt(selectedServiceId));
      if (selectedService && selectedService.barber_id) {
        setSelectedWorkerId(selectedService.barber_id.toString());
      }
    }
  }, [selectedServiceId, services]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedServiceId || !selectedWorkerId || !appointmentDate || !appointmentTime) {
      setError(language === 'en' ? 'Please fill all fields' : language === 'tr' ? 'Lütfen tüm alanları doldurun' : 'Заполните все поля');
      return;
    }

    try {
      // Combine date and time into ISO format
      const startTime = `${appointmentDate}T${appointmentTime}:00`;

      const response = await api.post('/bookings/', {
        service_id: parseInt(selectedServiceId),
        barber_id: parseInt(selectedWorkerId),
        start_time: startTime
      });

      // Get service details for payment
      const selectedService = services.find(s => s.id === parseInt(selectedServiceId));

      setCreatedBooking({
        ...response.data,
        service: selectedService
      });

      // Open payment dialog
      setPaymentDialogOpen(true);
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.detail || (language === 'en' ? 'Failed to create appointment' : language === 'tr' ? 'Randevu oluşturulamadı' : 'Ошибка'));
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    setSuccess(true);
    setPaymentDialogOpen(false);
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const categories = [
    { value: 'beauty', label: language === 'en' ? '💅 Beauty & Wellness' : language === 'tr' ? '💅 Güzellik & Sağlık' : '💅 Красота' },
    { value: 'barber', label: language === 'en' ? '💈 Barber' : language === 'tr' ? '💈 Berber' : '💈 Парикмахер' },
    { value: 'automotive', label: language === 'en' ? '🚗 Automotive' : language === 'tr' ? '🚗 Otomotiv' : '🚗 Авто' },
    { value: 'pet_care', label: language === 'en' ? '🐾 Pet Care' : language === 'tr' ? '🐾 Evcil Hayvan' : '🐾 Питомцы' },
    { value: 'home_services', label: language === 'en' ? '🏠 Home Services' : language === 'tr' ? '🏠 Ev Hizmetleri' : '🏠 Дом' },
    { value: 'health', label: language === 'en' ? '⚕️ Health' : language === 'tr' ? '⚕️ Sağlık' : '⚕️ Здоровье' },
    { value: 'other', label: language === 'en' ? '📋 Other' : language === 'tr' ? '📋 Diğer' : '📋 Другое' }
  ];

  return (
    <>
      <Header />

    <Box sx={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(-45deg, #2d3748, #4fd5c7, #00c9a7, #00d4aa)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      py: { xs: 4, md: 6 },
      '@keyframes gradientShift': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' }
      },
      '@keyframes float': {
        '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
        '50%': { transform: 'translateY(-20px) rotate(5deg)' }
      },
      '@keyframes floatReverse': {
        '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
        '50%': { transform: 'translateY(20px) rotate(-5deg)' }
      },
      '@keyframes pulse': {
        '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
        '50%': { opacity: 0.8, transform: 'scale(1.05)' }
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        top: '-250px',
        left: '-250px',
        animation: 'float 20s ease-in-out infinite'
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        bottom: '-200px',
        right: '-200px',
        animation: 'floatReverse 15s ease-in-out infinite'
      }
    }}>
      {/* Floating decorative shapes */}
      <Box sx={{
        position: 'absolute',
        width: { xs: '120px', md: '200px' },
        height: { xs: '120px', md: '200px' },
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        background: 'rgba(255,255,255,0.07)',
        top: '15%',
        right: { xs: '5%', md: '10%' },
        animation: 'float 18s ease-in-out infinite',
        animationDelay: '2s',
        display: { xs: 'none', sm: 'block' }
      }} />
      <Box sx={{
        position: 'absolute',
        width: { xs: '100px', md: '150px' },
        height: { xs: '100px', md: '150px' },
        borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
        background: 'rgba(255,255,255,0.05)',
        bottom: '20%',
        left: { xs: '5%', md: '15%' },
        animation: 'floatReverse 16s ease-in-out infinite',
        animationDelay: '1s',
        display: { xs: 'none', sm: 'block' }
      }} />
      <Box sx={{
        position: 'absolute',
        width: { xs: '60px', md: '100px' },
        height: { xs: '60px', md: '100px' },
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        top: '60%',
        right: { xs: '10%', md: '20%' },
        animation: 'pulse 10s ease-in-out infinite',
        display: { xs: 'none', md: 'block' }
      }} />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Card sx={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          borderRadius: 4,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.5)',
          overflow: 'visible',
          position: 'relative',
          animation: 'fadeInUp 0.6s ease-out',
          '@keyframes fadeInUp': {
            '0%': { opacity: 0, transform: 'translateY(30px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #2d3748, #4fd5c7, #00c9a7)',
            borderRadius: '4px 4px 0 0'
          }
        }}>
          <CardContent sx={{ p: { xs: 3, md: 6 } }}>
            <Typography variant="h3" sx={{
              mb: 4,
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: { xs: '2rem', md: '2.5rem' },
              background: 'linear-gradient(45deg, #2d3748, #4fd5c7, #00c9a7)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 3s linear infinite',
              '@keyframes shimmer': {
                '0%': { backgroundPosition: '0% center' },
                '100%': { backgroundPosition: '200% center' }
              }
            }}>
              {language === 'en' ? 'Book an Appointment' : language === 'tr' ? 'Randevu Al' : 'Забронировать'}
            </Typography>

            {/* Current Date Display */}
            <Box sx={{
              textAlign: 'center',
              mb: 4,
              pb: 3,
              borderBottom: '2px solid rgba(0,166,147,0.1)'
            }}>
              <Typography variant="h6" sx={{
                color: '#2d3748',
                fontWeight: 600,
                fontSize: { xs: '1rem', md: '1.2rem' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}>
                <CalendarToday sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                {currentDate}
              </Typography>
            </Box>

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {language === 'en' ? 'Appointment booked successfully!' : language === 'tr' ? 'Randevu başarıyla alındı!' : 'Успешно забронировано!'}
              </Alert>
            )}

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                {/* Category Select */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return <em style={{ color: '#9ca3af' }}>
                            {language === 'en' ? 'Select a category...' : language === 'tr' ? 'Kategori seçin...' : 'Выберите категорию...'}
                          </em>;
                        }
                        const cat = categories.find(c => c.value === selected);
                        return cat ? cat.label : selected;
                      }}
                      sx={{
                        fontSize: { xs: '1rem', md: '1.15rem' },
                        minHeight: { xs: '56px', md: '68px' },
                        '& .MuiSelect-select': {
                          py: { xs: 2, md: 3 },
                          minHeight: { xs: '56px', md: '68px' },
                          display: 'flex',
                          alignItems: 'center'
                        },
                        '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2 }
                      }}
                    >
                      {categories.map(cat => (
                        <MenuItem key={cat.value} value={cat.value} sx={{ fontSize: '1.1rem', py: 2 }}>
                          {cat.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Business Select */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={!category || businesses.length === 0}>
                    <Select
                      value={selectedBusinessId}
                      onChange={(e) => setSelectedBusinessId(e.target.value)}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return <em style={{ color: '#9ca3af' }}>
                            {language === 'en' ? 'Select a business...' : language === 'tr' ? 'İşletme seçin...' : 'Выберите бизнес...'}
                          </em>;
                        }
                        const business = businesses.find(b => b.id === selected);
                        return business ? `🏢 ${business.business_name}` : selected;
                      }}
                      sx={{
                        fontSize: { xs: '1rem', md: '1.15rem' },
                        minHeight: { xs: '56px', md: '68px' },
                        '& .MuiSelect-select': {
                          py: { xs: 2, md: 3 },
                          minHeight: { xs: '56px', md: '68px' },
                          display: 'flex',
                          alignItems: 'center'
                        },
                        '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2 }
                      }}
                    >
                      {businesses.map(business => (
                        <MenuItem key={business.id} value={business.id} sx={{ fontSize: '1.1rem', py: 2 }}>
                          🏢 {business.business_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Service Select */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={!selectedBusinessId}>
                    <Select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return <em style={{ color: '#9ca3af' }}>
                            {language === 'en' ? 'Select a service...' : language === 'tr' ? 'Hizmet seçin...' : 'Выберите услугу...'}
                          </em>;
                        }
                        const service = services.find(s => s.id == selected);
                        return service ? `✂️ ${service.name} - $${service.price} (${service.duration} min)` : `Service #${selected}`;
                      }}
                      sx={{
                        fontSize: { xs: '1rem', md: '1.15rem' },
                        minHeight: { xs: '56px', md: '68px' },
                        '& .MuiSelect-select': {
                          py: { xs: 2, md: 3 },
                          minHeight: { xs: '56px', md: '68px' },
                          display: 'flex',
                          alignItems: 'center'
                        },
                        '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2 }
                      }}
                    >
                      {services.length === 0 ? (
                        <MenuItem disabled sx={{ fontSize: '1rem', py: 2 }}>
                          {language === 'en' ? 'No services available' : language === 'tr' ? 'Hizmet bulunamadı' : 'Нет услуг'}
                        </MenuItem>
                      ) : (
                        services.map(service => (
                          <MenuItem key={service.id} value={service.id} sx={{ fontSize: '1.1rem', py: 2 }}>
                            ✂️ {service.name} - ${service.price} ({service.duration} min)
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Worker Select - Shows worker assigned to selected service */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={!selectedServiceId}>
                    <Select
                      value={selectedWorkerId}
                      onChange={(e) => setSelectedWorkerId(e.target.value)}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return <em style={{ color: '#9ca3af' }}>
                            {language === 'en' ? 'Select Worker' : language === 'tr' ? 'Çalışan Seçin' : 'Выберите работника'}
                          </em>;
                        }
                        const worker = workers.find(w => w.id == selected);
                        return worker ? `👤 ${worker.name || worker.full_name || worker.email}` : `Worker #${selected}`;
                      }}
                      sx={{
                        fontSize: { xs: '1rem', md: '1.15rem' },
                        minHeight: { xs: '56px', md: '68px' },
                        '& .MuiSelect-select': {
                          py: { xs: 2, md: 3 },
                          minHeight: { xs: '56px', md: '68px' },
                          display: 'flex',
                          alignItems: 'center'
                        },
                        '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2 }
                      }}
                    >
                      {workers.map(worker => (
                        <MenuItem key={worker.id} value={worker.id} sx={{ fontSize: '1.1rem', py: 2 }}>
                          👤 {worker.name || worker.full_name || worker.email}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Date */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label={language === 'en' ? '📅 Date' : language === 'tr' ? '📅 Tarih' : '📅 Дата'}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    InputLabelProps={{ shrink: true, sx: { fontSize: '1.2rem', fontWeight: 500 } }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    sx={{
                      '& .MuiInputBase-input': {
                        py: { xs: 2, md: 3 },
                        fontSize: { xs: '1rem', md: '1.15rem' }
                      },
                      '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2 }
                    }}
                  />
                </Grid>

                {/* Time */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label={language === 'en' ? '🕐 Time' : language === 'tr' ? '🕐 Saat' : '🕐 Время'}
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    InputLabelProps={{ shrink: true, sx: { fontSize: '1.2rem', fontWeight: 500 } }}
                    sx={{
                      '& .MuiInputBase-input': {
                        py: { xs: 2, md: 3 },
                        fontSize: { xs: '1rem', md: '1.15rem' }
                      },
                      '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2 }
                    }}
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={!selectedServiceId || !selectedWorkerId || !appointmentDate || !appointmentTime}
                    sx={{
                      bgcolor: '#2d3748',
                      py: { xs: 2, md: 2.5 },
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                      fontWeight: 'bold',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,166,147,0.3)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        bgcolor: '#1a202c',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 25px rgba(0,166,147,0.4)'
                      },
                      '&:disabled': {
                        bgcolor: '#ccc'
                      }
                    }}
                  >
                    {language === 'en' ? '✅ Book Appointment' : language === 'tr' ? '✅ Randevu Al' : '✅ Забронировать'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Grid container spacing={4} sx={{ mt: 6, mb: 8 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              p: 3,
              textAlign: 'center',
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-10px)' }
            }}>
              <CheckCircle sx={{ fontSize: 60, color: '#2d3748', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#2d3748' }}>
                {language === 'en' ? 'Instant Confirmation' : language === 'tr' ? 'Anında Onay' : 'Мгновенное подтверждение'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {language === 'en'
                  ? 'Get instant booking confirmation via email'
                  : language === 'tr'
                  ? 'E-posta ile anında rezervasyon onayı alın'
                  : 'Получите мгновенное подтверждение по электронной почте'}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              p: 3,
              textAlign: 'center',
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-10px)' }
            }}>
              <Speed sx={{ fontSize: 60, color: '#2d3748', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#2d3748' }}>
                {language === 'en' ? 'Quick & Easy' : language === 'tr' ? 'Hızlı & Kolay' : 'Быстро и легко'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {language === 'en'
                  ? 'Book your appointment in less than 2 minutes'
                  : language === 'tr'
                  ? '2 dakikadan kısa sürede randevu alın'
                  : 'Забронируйте встречу менее чем за 2 минуты'}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              p: 3,
              textAlign: 'center',
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-10px)' }
            }}>
              <Security sx={{ fontSize: 60, color: '#2d3748', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#2d3748' }}>
                {language === 'en' ? 'Secure & Safe' : language === 'tr' ? 'Güvenli' : 'Безопасно'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {language === 'en'
                  ? 'Your data is protected with industry-standard encryption'
                  : language === 'tr'
                  ? 'Verileriniz endüstri standardı şifreleme ile korunur'
                  : 'Ваши данные защищены шифрованием'}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>

    {/* Footer */}
    <Box sx={{
      bgcolor: '#1a1a1a',
      color: 'white',
      py: 6
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Logo size="small" variant="white" />
            </Box>
            <Typography variant="body2" sx={{ mb: 2, color: '#b0b0b0' }}>
              {language === 'en'
                ? 'Your trusted platform for booking appointments with top-rated businesses across Europe.'
                : language === 'tr'
                ? 'Avrupa genelinde en iyi işletmelerle randevu almak için güvenilir platformunuz.'
                : 'Ваша надежная платформа для записи на прием в лучшие компании Европы.'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              {language === 'en' ? 'Quick Links' : language === 'tr' ? 'Hızlı Bağlantılar' : 'Быстрые ссылки'}
            </Typography>
            <Stack spacing={1}>
              <Link href="/" color="inherit" underline="hover" sx={{ color: '#b0b0b0', cursor: 'pointer' }}>
                {language === 'en' ? 'Home' : language === 'tr' ? 'Ana Sayfa' : 'Главная'}
              </Link>
              <Link href="/services" color="inherit" underline="hover" sx={{ color: '#b0b0b0', cursor: 'pointer' }}>
                {language === 'en' ? 'Services' : language === 'tr' ? 'Hizmetler' : 'Услуги'}
              </Link>
              <Link href="/about" color="inherit" underline="hover" sx={{ color: '#b0b0b0', cursor: 'pointer' }}>
                {language === 'en' ? 'About' : language === 'tr' ? 'Hakkımızda' : 'О нас'}
              </Link>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              {language === 'en' ? 'Contact' : language === 'tr' ? 'İletişim' : 'Контакты'}
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#b0b0b0' }}>
                <Email sx={{ fontSize: 20 }} />
                <Typography variant="body2">info@aponti.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#b0b0b0' }}>
                <Phone sx={{ fontSize: 20 }} />
                <Typography variant="body2">+90 555 123 4567</Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <IconButton sx={{ color: '#2d3748', bgcolor: 'rgba(0,166,147,0.1)' }}>
                  <Facebook />
                </IconButton>
                <IconButton sx={{ color: '#2d3748', bgcolor: 'rgba(0,166,147,0.1)' }}>
                  <Instagram />
                </IconButton>
                <IconButton sx={{ color: '#2d3748', bgcolor: 'rgba(0,166,147,0.1)' }}>
                  <Twitter />
                </IconButton>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="body2" sx={{ textAlign: 'center', color: '#b0b0b0' }}>
          © 2025 Aponti. {language === 'en' ? 'All rights reserved.' : language === 'tr' ? 'Tüm hakları saklıdır.' : 'Все права защищены.'}
        </Typography>
      </Container>
    </Box>

    {/* Payment Dialog */}
    {createdBooking && (
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        booking={createdBooking}
        onPaymentSuccess={handlePaymentSuccess}
      />
    )}
    </>
  );
};

export default AppointmentNew;
