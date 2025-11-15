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
  TextField,
  Grid
} from '@mui/material';
import {
  CheckCircle,
  Payment as PaymentIcon,
  ArrowBack,
  CreditCard
} from '@mui/icons-material';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [showCardForm, setShowCardForm] = useState(false);

  // Card form state
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  // Get booking details from navigation state
  const booking = location.state?.booking;
  const servicePrice = location.state?.servicePrice || 0;
  const businessId = location.state?.businessId || booking?.business_id;

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

    if (!showCardForm) {
      // Show card form
      setShowCardForm(true);
      return;
    }

    // Validate card data
    if (!cardData.cardNumber || !cardData.cardName || !cardData.expiryMonth || !cardData.expiryYear || !cardData.cvv) {
      setError('Please fill in all card details');
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

      // Check if 2Checkout is loaded
      if (!window.TCO) {
        setError('Payment system not loaded. Please refresh the page and try again.');
        setLoading(false);
        return;
      }

      if (!response.data.merchant_code) {
        setError('Payment configuration error. Please contact support.');
        setLoading(false);
        return;
      }

      // Validate and clean card data
      const cleanCardNumber = (cardData.cardNumber || '').replace(/\s/g, '');
      const cleanCvv = (cardData.cvv || '').trim();
      const cleanMonth = (cardData.expiryMonth || '').trim();
      const cleanYear = (cardData.expiryYear || '').trim();

      // Validate all fields are filled
      if (!cleanCardNumber || !cleanCvv || !cleanMonth || !cleanYear || !cardData.cardName) {
        setError('Please fill in all card details');
        setLoading(false);
        return;
      }

      console.log('Card data validated, preparing payment...');

      // DEMO MODE: Simulate payment for testing
      // In production, you would use 2Checkout tokenization here
      // For now, we'll use demo mode with card validation

      // Validate test card (any card number works in demo mode)
      if (cleanCardNumber.length < 13) {
        setError('Invalid card number. Must be at least 13 digits.');
        setLoading(false);
        return;
      }

      // Simulate a small delay for realistic UX
      setTimeout(() => {
        // Generate a demo token (in production, this would come from 2Checkout)
        const demoToken = `demo_tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('Demo payment token generated:', demoToken);

        // Complete payment with demo token
        completePayment(demoToken, response.data.order_reference);
      }, 800);

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.detail || 'Failed to create payment session');
      setLoading(false);
    }
  };

  const completePayment = async (token, orderRef) => {
    try {
      // Send token to backend to complete the payment
      const response = await api.post('/payments/complete', {
        token: token,
        order_reference: orderRef,
        booking_id: booking.id
      });

      console.log('Payment completed:', response.data);

      // Redirect to success with payment breakdown
      navigate('/payment/success', {
        state: {
          ...response.data,
          booking: booking
        }
      });
    } catch (err) {
      console.error('Payment completion error:', err);
      setError('Payment processing failed. Please try again.');
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

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;

    // Format card number with spaces
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; // Max 16 digits + 3 spaces
    }

    // Limit CVV to 4 digits
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return;
    }

    // Limit month to 2 digits
    if (field === 'expiryMonth') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 2) return;
      if (parseInt(formattedValue) > 12) return;
    }

    // Limit year to 4 digits
    if (field === 'expiryYear') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return;
    }

    setCardData({ ...cardData, [field]: formattedValue });
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
      testMode: 'TEST MODE - Use test card: 4111 1111 1111 1111',
      cardNumber: 'Card Number',
      cardName: 'Cardholder Name',
      expiryDate: 'Expiry Date',
      month: 'Month',
      year: 'Year',
      cvv: 'CVV',
      paymentDetails: 'Payment Details',
      enterCardDetails: 'Enter Card Details',
      processPayment: 'Process Payment'
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
      testMode: 'TEST MODU - Test kartı: 4111 1111 1111 1111',
      cardNumber: 'Kart Numarası',
      cardName: 'Kart Sahibinin Adı',
      expiryDate: 'Son Kullanma Tarihi',
      month: 'Ay',
      year: 'Yıl',
      cvv: 'CVV',
      paymentDetails: 'Ödeme Detayları',
      enterCardDetails: 'Kart Bilgilerini Girin',
      processPayment: 'Ödemeyi İşle'
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
      testMode: 'ТЕСТОВЫЙ РЕЖИМ - Тестовая карта: 4111 1111 1111 1111',
      cardNumber: 'Номер карты',
      cardName: 'Имя владельца карты',
      expiryDate: 'Срок действия',
      month: 'Месяц',
      year: 'Год',
      cvv: 'CVV',
      paymentDetails: 'Детали платежа',
      enterCardDetails: 'Введите данные карты',
      processPayment: 'Обработать платеж'
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
                navigate(-1); // Go back to previous page
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

        {/* Card Form (shown when Pay Now is clicked) */}
        {showCardForm && (
          <Card sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{
                fontWeight: 'bold',
                mb: 3,
                color: '#1a202c',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CreditCard sx={{ color: '#00BFA6' }} /> {t.paymentDetails}
              </Typography>

              <Grid container spacing={3}>
                {/* Card Number */}
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{
                    display: 'block',
                    mb: 1,
                    color: '#4a5568',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}>
                    {t.cardNumber}
                  </Typography>
                  <TextField
                    fullWidth
                    value={cardData.cardNumber}
                    onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                    placeholder="4111 1111 1111 1111"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        '&:hover fieldset': {
                          borderColor: '#00BFA6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#00BFA6',
                          borderWidth: '2px',
                        }
                      },
                      '& input': {
                        fontSize: '1.1rem',
                        letterSpacing: '0.05em',
                        fontFamily: 'monospace'
                      }
                    }}
                  />
                </Grid>

                {/* Cardholder Name */}
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{
                    display: 'block',
                    mb: 1,
                    color: '#4a5568',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}>
                    {t.cardName}
                  </Typography>
                  <TextField
                    fullWidth
                    value={cardData.cardName}
                    onChange={(e) => handleCardInputChange('cardName', e.target.value)}
                    placeholder="John Doe"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        '&:hover fieldset': {
                          borderColor: '#00BFA6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#00BFA6',
                          borderWidth: '2px',
                        }
                      },
                      '& input': {
                        fontSize: '1rem'
                      }
                    }}
                  />
                </Grid>

                {/* Expiry Date and CVV Row */}
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <Typography variant="caption" sx={{
                        display: 'block',
                        mb: 1,
                        color: '#4a5568',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}>
                        {t.expiryDate}
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            value={cardData.expiryMonth}
                            onChange={(e) => handleCardInputChange('expiryMonth', e.target.value)}
                            placeholder="MM"
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                '&:hover fieldset': {
                                  borderColor: '#00BFA6',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#00BFA6',
                                  borderWidth: '2px',
                                }
                              },
                              '& input': {
                                fontSize: '1rem',
                                textAlign: 'center',
                                fontFamily: 'monospace'
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            value={cardData.expiryYear}
                            onChange={(e) => handleCardInputChange('expiryYear', e.target.value)}
                            placeholder="YYYY"
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                '&:hover fieldset': {
                                  borderColor: '#00BFA6',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#00BFA6',
                                  borderWidth: '2px',
                                }
                              },
                              '& input': {
                                fontSize: '1rem',
                                textAlign: 'center',
                                fontFamily: 'monospace'
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{
                        display: 'block',
                        mb: 1,
                        color: '#4a5568',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}>
                        {t.cvv}
                      </Typography>
                      <TextField
                        fullWidth
                        value={cardData.cvv}
                        onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                        placeholder="123"
                        variant="outlined"
                        type="password"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                            '&:hover fieldset': {
                              borderColor: '#00BFA6',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#00BFA6',
                              borderWidth: '2px',
                            }
                          },
                          '& input': {
                            fontSize: '1rem',
                            textAlign: 'center',
                            letterSpacing: '0.15em',
                            fontFamily: 'monospace'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* Security Note */}
              <Box sx={{
                mt: 3,
                p: 2,
                bgcolor: '#f0fdf4',
                borderRadius: 2,
                border: '1px solid #bbf7d0'
              }}>
                <Typography variant="caption" sx={{ color: '#166534', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ fontSize: '1.2rem' }}>🔒</span>
                  {language === 'en'
                    ? 'Your payment information is encrypted and secure'
                    : language === 'tr'
                    ? 'Ödeme bilgileriniz şifreli ve güvenli'
                    : 'Ваша платежная информация зашифрована и защищена'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
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
                {loading ? t.processing : (showCardForm ? t.processPayment : t.payNow)}
              </Button>

              {!showCardForm && (
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
              )}

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
