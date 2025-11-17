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
  Stack,
  Chip
} from '@mui/material';
import {
  Payment as PaymentIcon,
  ArrowBack,
  CheckCircle
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
  const bookingData = location.state?.bookingData; // Booking data to create after payment
  const booking = location.state?.booking; // For backward compatibility
  const servicePrice = location.state?.servicePrice || 0;
  const serviceName = location.state?.serviceName || booking?.service_name || 'Service';
  const workerName = location.state?.workerName || 'Worker';
  const businessName = location.state?.businessName || 'Business';
  const businessId = location.state?.businessId || booking?.business_id;

  // Load Stripe configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await api.get('/payments/config');
        setPaymentConfig(response.data);
        console.log('✅ Stripe configuration loaded:', response.data);
      } catch (err) {
        console.error('❌ Failed to load payment config:', err);
        setError('Failed to load payment configuration');
      }
    };
    loadConfig();
  }, []);

  // Redirect if no booking data
  useEffect(() => {
    if (!booking && !bookingData) {
      setTimeout(() => {
        if (businessId) {
          navigate(`/business/${businessId}`);
        } else {
          navigate('/');
        }
      }, 2000);
    }
  }, [booking, bookingData, navigate, businessId]);

  const handlePayment = async () => {
    if (!bookingData && !booking) {
      setError('No booking information found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First create the booking
      let finalBooking = booking;

      if (bookingData && !booking) {
        console.log('Creating booking before payment...');
        const bookingResponse = await api.post('/bookings/', bookingData);
        finalBooking = bookingResponse.data;
        console.log('✅ Booking created:', finalBooking);
      }

      // Store booking info in localStorage for success callback
      localStorage.setItem('aponti_pending_booking', JSON.stringify({
        booking: {
          ...finalBooking,
          service_name: serviceName,
          business_name: businessName,
          service_price: servicePrice
        }
      }));

      // Create Stripe Checkout session
      console.log('🔄 Creating Stripe Checkout session...');
      const checkoutResponse = await api.post('/payments/stripe/create-checkout-session', {
        booking_id: finalBooking.id,
        success_url: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${finalBooking.id}`,
        cancel_url: `${window.location.origin}/payment?booking_id=${finalBooking.id}`
      });

      console.log('✅ Stripe Checkout session created:', checkoutResponse.data);

      // Redirect to Stripe Checkout
      window.location.href = checkoutResponse.data.session_url;

    } catch (err) {
      console.error('❌ Payment initialization error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const handleSkipPayment = () => {
    // For demo purposes, allow skipping payment
    if (businessId) {
      navigate(`/business/${businessId}`, {
        state: {
          message: 'Booking created successfully! Payment can be made later.'
        }
      });
    } else {
      navigate('/');
    }
  };

  // Calculate commission breakdown
  const platformCommission = paymentConfig
    ? servicePrice * (paymentConfig.platform_commission_percent / 100)
    : 0;
  const sellerAmount = servicePrice - platformCommission;

  const content = {
    en: {
      title: 'Complete Payment',
      bookingDetails: 'Booking Details',
      service: 'Service',
      worker: 'Staff Member',
      business: 'Business',
      date: 'Date',
      time: 'Time',
      amount: 'Total Amount',
      payNow: 'Pay with Stripe',
      payLater: 'Pay Later',
      processing: 'Redirecting to Stripe...',
      securePayment: 'Secure payment powered by Stripe',
      noBooking: 'No booking information found. Redirecting...',
      paymentBreakdown: 'Payment Breakdown',
      serviceAmount: 'Service Amount',
      platformFee: 'Platform Fee',
      providerReceives: 'Provider Receives'
    },
    tr: {
      title: 'Ödemeyi Tamamla',
      bookingDetails: 'Rezervasyon Detayları',
      service: 'Hizmet',
      worker: 'Çalışan',
      business: 'İşletme',
      date: 'Tarih',
      time: 'Saat',
      amount: 'Toplam Tutar',
      payNow: 'Stripe ile Öde',
      payLater: 'Sonra Öde',
      processing: 'Stripe\'a yönlendiriliyor...',
      securePayment: 'Stripe ile güvenli ödeme',
      noBooking: 'Rezervasyon bilgisi bulunamadı. Yönlendiriliyor...',
      paymentBreakdown: 'Ödeme Detayları',
      serviceAmount: 'Hizmet Tutarı',
      platformFee: 'Platform Ücreti',
      providerReceives: 'Sağlayıcı Alacak'
    },
    ru: {
      title: 'Завершить оплату',
      bookingDetails: 'Детали бронирования',
      service: 'Услуга',
      worker: 'Сотрудник',
      business: 'Бизнес',
      date: 'Дата',
      time: 'Время',
      amount: 'Общая сумма',
      payNow: 'Оплатить через Stripe',
      payLater: 'Оплатить позже',
      processing: 'Перенаправление на Stripe...',
      securePayment: 'Безопасный платеж через Stripe',
      noBooking: 'Информация о бронировании не найдена. Перенаправление...',
      paymentBreakdown: 'Детали платежа',
      serviceAmount: 'Стоимость услуги',
      platformFee: 'Комиссия платформы',
      providerReceives: 'Получит поставщик'
    }
  };

  const t = content[language];

  if (!booking && !bookingData) {
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
            onClick={() => {
              if (businessId) {
                navigate(`/business/${businessId}`);
              } else {
                navigate(-1);
              }
            }}
            sx={{ mb: 2 }}
          >
            {language === 'en' ? 'Back to Business' : language === 'tr' ? 'İşletmeye Dön' : 'Вернуться к бизнесу'}
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
                <Typography fontWeight={600}>{serviceName}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">{t.business}:</Typography>
                <Typography fontWeight={600}>{businessName}</Typography>
              </Box>

              {workerName && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">{t.worker}:</Typography>
                  <Typography fontWeight={600}>{workerName}</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">{t.date}:</Typography>
                <Typography fontWeight={600}>
                  {(booking?.start_time || bookingData?.start_time)
                    ? new Date(booking?.start_time || bookingData?.start_time).toLocaleDateString()
                    : '-'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">{t.time}:</Typography>
                <Typography fontWeight={600}>
                  {(booking?.start_time || bookingData?.start_time)
                    ? new Date(booking?.start_time || bookingData?.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '-'}
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

        {/* Payment Breakdown Card */}
        {paymentConfig && (
          <Card sx={{ mb: 3, borderRadius: 2, bgcolor: '#f8f9fa' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#6b7280' }}>
                {t.paymentBreakdown}
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">{t.serviceAmount}</Typography>
                  <Typography variant="body2" fontWeight={500}>${servicePrice.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">{t.platformFee}</Typography>
                    <Chip
                      label={`${paymentConfig.platform_commission_percent}%`}
                      size="small"
                      sx={{ height: '20px', fontSize: '0.7rem' }}
                    />
                  </Box>
                  <Typography variant="body2" fontWeight={500}>${platformCommission.toFixed(2)}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    {t.providerReceives}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    ${sellerAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Test Mode Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CheckCircle fontSize="small" />
            <Box>
              <Typography variant="body2" fontWeight={600}>TEST MODE</Typography>
              <Typography variant="caption">
                Use test card: 4242 4242 4242 4242 (any future date, any 3-digit CVV)
              </Typography>
            </Box>
          </Stack>
        </Alert>

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
                  bgcolor: '#635BFF',
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: '#5248E6'
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
