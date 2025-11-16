import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Stack,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  AccountBalance,
  Store,
  Receipt
} from '@mui/icons-material';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const completePayment = async () => {
      try {
        // Parse URL parameters from 2Checkout redirect
        const params = new URLSearchParams(location.search);
        const bookingId = params.get('booking_id');
        const orderRef = params.get('order_ref');
        const orderNumber = params.get('order_number'); // 2Checkout order number

        console.log('2Checkout redirect params:', { bookingId, orderRef, orderNumber });

        if (!bookingId || !orderRef) {
          // Try to get from navigation state (for backward compatibility)
          const stateDetails = location.state;
          if (stateDetails) {
            setPaymentDetails(stateDetails);
            setLoading(false);
            return;
          }

          setError('Missing payment information');
          setLoading(false);
          return;
        }

        // Call backend to complete payment
        const response = await api.post('/payments/complete', {
          booking_id: parseInt(bookingId),
          order_reference: orderRef,
          order_number: orderNumber
        });

        console.log('Payment completed:', response.data);

        // Set payment details with breakdown
        const totalAmount = response.data.amount || 0;
        const platformFee = totalAmount * 0.1;
        const businessAmount = totalAmount * 0.9;

        setPaymentDetails({
          ...response.data,
          total_amount: totalAmount,
          platform_fee: platformFee,
          business_amount: businessAmount,
          order_reference: orderRef
        });

        setLoading(false);
      } catch (err) {
        console.error('Payment completion error:', err);
        setError(err.response?.data?.detail || 'Failed to complete payment');
        setLoading(false);
      }
    };

    completePayment();
  }, [location]);

  const content = {
    en: {
      title: 'Payment Successful!',
      message: 'Your booking has been confirmed and payment completed successfully.',
      viewBookings: 'View My Bookings',
      orderNumber: 'Order Reference',
      paymentBreakdown: 'Payment Breakdown',
      totalPaid: 'Total Paid',
      platformFee: 'Platform Fee (10%)',
      businessReceives: 'Business Receives (90%)',
      service: 'Service',
      business: 'Business',
      testMode: 'TEST MODE - No real money was charged'
    },
    tr: {
      title: 'Ödeme Başarılı!',
      message: 'Rezervasyonunuz onaylandı ve ödemeniz başarıyla tamamlandı.',
      viewBookings: 'Rezervasyonlarımı Gör',
      orderNumber: 'Sipariş Referansı',
      paymentBreakdown: 'Ödeme Dağılımı',
      totalPaid: 'Toplam Ödenen',
      platformFee: 'Platform Komisyonu (%10)',
      businessReceives: 'İşletme Alacak (%90)',
      service: 'Hizmet',
      business: 'İşletme',
      testMode: 'TEST MODU - Gerçek para çekilmedi'
    },
    ru: {
      title: 'Оплата успешна!',
      message: 'Ваше бронирование подтверждено, оплата успешно завершена.',
      viewBookings: 'Мои бронирования',
      orderNumber: 'Номер заказа',
      paymentBreakdown: 'Разбивка платежа',
      totalPaid: 'Всего оплачено',
      platformFee: 'Комиссия платформы (10%)',
      businessReceives: 'Бизнес получает (90%)',
      service: 'Услуга',
      business: 'Бизнес',
      testMode: 'ТЕСТОВЫЙ РЕЖИМ - Настоящие деньги не списаны'
    }
  };

  const t = content[language];

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#00BFA6' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{ bgcolor: '#00BFA6', '&:hover': { bgcolor: '#00A693' } }}
          >
            {t.viewBookings}
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        {/* Success Icon */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircle sx={{ fontSize: 100, color: '#00BFA6', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: '#2d3748' }}>
            {t.title}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {t.message}
          </Typography>
        </Box>

        {/* Payment Details Card */}
        <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Order Reference */}
            {paymentDetails?.order_reference && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Chip
                  icon={<Receipt />}
                  label={`${t.orderNumber}: ${paymentDetails.order_reference}`}
                  sx={{ fontSize: '0.9rem', py: 2.5, px: 1 }}
                />
              </Box>
            )}

            {/* Service & Business Info */}
            {paymentDetails && (
              <Stack spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">{t.service}:</Typography>
                  <Typography fontWeight={600}>{paymentDetails.service_name || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">{t.business}:</Typography>
                  <Typography fontWeight={600}>{paymentDetails.business_name || '-'}</Typography>
                </Box>
              </Stack>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Payment Breakdown */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2d3748' }}>
              {t.paymentBreakdown}
            </Typography>

            <Stack spacing={2.5}>
              {/* Total Paid */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                bgcolor: '#f7fafc',
                borderRadius: 2
              }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Receipt sx={{ color: '#4a5568' }} />
                  {t.totalPaid}
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  ${paymentDetails?.total_amount?.toFixed(2) || '0.00'}
                </Typography>
              </Box>

              {/* Platform Fee */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pl: 4
              }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <AccountBalance sx={{ fontSize: 20, color: '#00BFA6' }} />
                  {t.platformFee}
                </Typography>
                <Typography fontWeight={600} sx={{ color: '#00BFA6' }}>
                  ${paymentDetails?.platform_fee?.toFixed(2) || '0.00'}
                </Typography>
              </Box>

              {/* Business Receives */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pl: 4
              }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <Store sx={{ fontSize: 20, color: '#4299e1' }} />
                  {t.businessReceives}
                </Typography>
                <Typography fontWeight={600} sx={{ color: '#4299e1' }}>
                  ${paymentDetails?.business_amount?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
            </Stack>

            {/* Test Mode Notice */}
            <Box sx={{
              mt: 3,
              p: 2,
              bgcolor: '#fffbeb',
              borderRadius: 2,
              border: '1px solid #fef3c7'
            }}>
              <Typography variant="caption" sx={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: 1 }}>
                ⚠️ {t.testMode}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/dashboard')}
            sx={{
              bgcolor: '#00BFA6',
              px: 5,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#00A693'
              }
            }}
          >
            {t.viewBookings}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default PaymentSuccess;
