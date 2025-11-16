import React, { useState, useEffect, useRef } from 'react';
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
  TextField,
  Grid
} from '@mui/material';
import {
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
  const [paymentSession, setPaymentSession] = useState(null);
  const [twoCheckoutLoaded, setTwoCheckoutLoaded] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    ccNo: '',
    cvv: '',
    expMonth: '',
    expYear: ''
  });

  // Get booking details from navigation state
  const booking = location.state?.booking;
  const servicePrice = location.state?.servicePrice || 0;
  const businessId = location.state?.businessId || booking?.business_id;

  // Load 2Checkout.js library
  useEffect(() => {
    if (window.TwoPayClient) {
      setTwoCheckoutLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://secure.2checkout.com/checkout/client/twoCoInlineCart.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ 2Checkout library loaded successfully');
      setTwoCheckoutLoaded(true);
    };
    script.onerror = (e) => {
      console.error('❌ Failed to load 2Checkout library:', e);
      setError('Failed to load payment system');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Redirect if no booking data
  useEffect(() => {
    if (!booking) {
      setTimeout(() => {
        if (businessId) {
          navigate(`/business/${businessId}`);
        } else {
          navigate('/');
        }
      }, 2000);
    }
  }, [booking, navigate, businessId]);

  const handlePayment = async () => {
    if (!booking) {
      setError('No booking information found');
      return;
    }

    if (!twoCheckoutLoaded) {
      setError('Payment system is still loading. Please wait...');
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

      if (response.data.use_inline) {
        // Save session and show payment form
        setPaymentSession(response.data);
        setShowPaymentForm(true);
        setLoading(false);
      } else {
        setError('Payment configuration error. Please contact support.');
        setLoading(false);
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.detail || 'Failed to create payment session');
      setLoading(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!cardDetails.ccNo || !cardDetails.cvv || !cardDetails.expMonth || !cardDetails.expYear) {
      setError('Please fill in all card details');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Initialize 2Checkout
      window.TwoPayClient.setup(paymentSession.merchant_code);

      // Tokenize card details
      const args = {
        sellerId: paymentSession.merchant_code,
        publishableKey: paymentSession.publishable_key,
        ccNo: cardDetails.ccNo,
        cvv: cardDetails.cvv,
        expMonth: cardDetails.expMonth,
        expYear: cardDetails.expYear
      };

      window.TwoPayClient.tokenize(args, (data) => {
        console.log('2Checkout tokenization successful:', data);
        completePayment(data.response.token.token, paymentSession.order_reference);
      }, (data) => {
        console.error('2Checkout tokenization failed:', data);
        setError(data.errorMsg || 'Payment processing failed');
        setLoading(false);
      });

    } catch (err) {
      console.error('Payment tokenization error:', err);
      setError('Failed to process payment');
      setLoading(false);
    }
  };

  const completePayment = async (token, orderReference) => {
    try {
      const response = await api.post('/payments/complete', {
        booking_id: booking.id,
        order_reference: orderReference,
        payment_token: token
      });

      console.log('Payment completed:', response.data);

      // Redirect to success page
      navigate('/payment/success', {
        state: {
          payment: response.data,
          booking: booking
        }
      });
    } catch (err) {
      console.error('Payment completion error:', err);
      setError(err.response?.data?.detail || 'Failed to complete payment');
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

  const content = {
    en: {
      title: 'Complete Payment',
      bookingDetails: 'Booking Details',
      service: 'Service',
      date: 'Date',
      time: 'Time',
      amount: 'Amount',
      payNow: 'Pay Now',
      payLater: 'Pay Later',
      processing: 'Redirecting to payment...',
      securePayment: 'Secure payment powered by 2Checkout',
      noBooking: 'No booking information found. Redirecting...'
    },
    tr: {
      title: 'Ödemeyi Tamamla',
      bookingDetails: 'Rezervasyon Detayları',
      service: 'Hizmet',
      date: 'Tarih',
      time: 'Saat',
      amount: 'Tutar',
      payNow: 'Şimdi Öde',
      payLater: 'Sonra Öde',
      processing: 'Ödemeye yönlendiriliyor...',
      securePayment: '2Checkout ile güvenli ödeme',
      noBooking: 'Rezervasyon bilgisi bulunamadı. Yönlendiriliyor...'
    },
    ru: {
      title: 'Завершить оплату',
      bookingDetails: 'Детали бронирования',
      service: 'Услуга',
      date: 'Дата',
      time: 'Время',
      amount: 'Сумма',
      payNow: 'Оплатить сейчас',
      payLater: 'Оплатить позже',
      processing: 'Перенаправление на оплату...',
      securePayment: 'Безопасный платеж через 2Checkout',
      noBooking: 'Информация о бронировании не найдена. Перенаправление...'
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

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Test Mode Alert */}
        {paymentSession?.sandbox && (
          <Alert severity="info" sx={{ mb: 3 }}>
            TEST MODE - Use test card: 4111 1111 1111 1111
          </Alert>
        )}

        {/* Payment Form - Show when payment session is created */}
        {showPaymentForm && paymentSession && (
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#2d3748' }}>
                Card Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    placeholder="4111 1111 1111 1111"
                    value={cardDetails.ccNo}
                    onChange={(e) => setCardDetails({...cardDetails, ccNo: e.target.value.replace(/\s/g, '')})}
                    inputProps={{ maxLength: 16 }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Month"
                    placeholder="MM"
                    value={cardDetails.expMonth}
                    onChange={(e) => setCardDetails({...cardDetails, expMonth: e.target.value})}
                    inputProps={{ maxLength: 2 }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Year"
                    placeholder="YYYY"
                    value={cardDetails.expYear}
                    onChange={(e) => setCardDetails({...cardDetails, expYear: e.target.value})}
                    inputProps={{ maxLength: 4 }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="CVV"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                    inputProps={{ maxLength: 4 }}
                    type="password"
                  />
                </Grid>
              </Grid>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                onClick={handleSubmitPayment}
                disabled={loading}
                sx={{
                  mt: 3,
                  bgcolor: '#00BFA6',
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#00A693' }
                }}
              >
                {loading ? 'Processing...' : 'Complete Payment'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Actions - Only show before payment form */}
        {!showPaymentForm && (
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
        )}
      </Container>
    </Box>
  );
};

export default Payment;
