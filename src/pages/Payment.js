import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import {
  CheckCircle,
  Payment as PaymentIcon,
  ArrowBack
} from '@mui/icons-material';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null);

  // Get booking details from navigation state
  const booking = location.state?.booking;
  const servicePrice = location.state?.servicePrice || 0;

  useEffect(() => {
    // Fetch payment configuration
    const fetchPaymentConfig = async () => {
      try {
        const response = await api.get('/payments/config');
        setPaymentConfig(response.data);
      } catch (err) {
        console.error('Error fetching payment config:', err);
        setError('Failed to load payment configuration');
      }
    };

    fetchPaymentConfig();

    // Redirect if no booking data
    if (!booking) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [booking, navigate]);

  const handlePayment = async () => {
    if (!booking) {
      setError('No booking information found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment session
      const response = await api.post('/payments/create-session', {
        booking_id: booking.id,
        amount: servicePrice,
        currency: 'USD'
      });

      console.log('Payment session created:', response.data);

      // Redirect to 2Checkout
      window.location.href = response.data.redirect_url;

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.detail || 'Failed to create payment session');
      setLoading(false);
    }
  };

  const handleSkipPayment = () => {
    // For demo purposes, allow skipping payment
    navigate('/dashboard', {
      state: {
        message: 'Booking created successfully! Payment can be made later.'
      }
    });
  };

  const content = {
    en: {
      title: 'Complete Payment',
      bookingDetails: 'Booking Details',
      service: 'Service',
      date: 'Date',
      time: 'Time',
      worker: 'Worker',
      amount: 'Amount',
      payNow: 'Pay Now',
      payLater: 'Pay Later',
      processing: 'Processing...',
      securePayment: 'Secure payment powered by 2Checkout',
      noBooking: 'No booking information found. Redirecting...',
      testMode: 'TEST MODE - Use test card: 4111 1111 1111 1111'
    },
    tr: {
      title: 'Ödemeyi Tamamla',
      bookingDetails: 'Rezervasyon Detayları',
      service: 'Hizmet',
      date: 'Tarih',
      time: 'Saat',
      worker: 'Çalışan',
      amount: 'Tutar',
      payNow: 'Şimdi Öde',
      payLater: 'Sonra Öde',
      processing: 'İşleniyor...',
      securePayment: '2Checkout ile güvenli ödeme',
      noBooking: 'Rezervasyon bilgisi bulunamadı. Yönlendiriliyor...',
      testMode: 'TEST MODU - Test kartı: 4111 1111 1111 1111'
    },
    ru: {
      title: 'Завершить оплату',
      bookingDetails: 'Детали бронирования',
      service: 'Услуга',
      date: 'Дата',
      time: 'Время',
      worker: 'Работник',
      amount: 'Сумма',
      payNow: 'Оплатить сейчас',
      payLater: 'Оплатить позже',
      processing: 'Обработка...',
      securePayment: 'Безопасный платеж через 2Checkout',
      noBooking: 'Информация о бронировании не найдена. Перенаправление...',
      testMode: 'ТЕСТОВЫЙ РЕЖИМ - Тестовая карта: 4111 1111 1111 1111'
    }
  };

  const t = content[language];

  if (!booking) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="warning">{t.noBooking}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mb: 2 }}
          >
            {language === 'en' ? 'Back to Dashboard' : language === 'tr' ? 'Panele Dön' : 'Назад к панели'}
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
            {t.title}
          </Typography>
        </Box>

        {/* Booking Details Card */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#2d3748' }}>
              {t.bookingDetails}
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">{t.service}:</Typography>
                <Typography fontWeight={600}>{booking.service_name || 'Service'}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">{t.date}:</Typography>
                <Typography fontWeight={600}>
                  {booking.start_time ? new Date(booking.start_time).toLocaleDateString() : '-'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">{t.time}:</Typography>
                <Typography fontWeight={600}>
                  {booking.start_time ? new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                <Typography variant="h6" fontWeight="bold">{t.amount}:</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  ${servicePrice.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Test Mode Alert */}
        {paymentConfig?.sandbox && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {t.testMode}
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Payment Actions */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                onClick={handlePayment}
                disabled={loading}
                sx={{
                  bgcolor: '#00BFA6',
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: '#00A693'
                  }
                }}
              >
                {loading ? t.processing : t.payNow}
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={handleSkipPayment}
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    bgcolor: '#f9fafb'
                  }
                }}
              >
                {t.payLater}
              </Button>

              <Typography
                variant="caption"
                sx={{ textAlign: 'center', color: 'text.secondary', pt: 2 }}
              >
                🔒 {t.securePayment}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Payment;
