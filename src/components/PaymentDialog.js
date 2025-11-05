import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  CreditCard,
  Money,
  AccountBalance,
  CheckCircle,
  Receipt
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const PaymentDialog = ({ open, onClose, booking, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  const minDeposit = booking?.service?.price ? booking.service.price * 0.1 : 0;
  const totalAmount = booking?.service?.price || 0;

  useEffect(() => {
    if (paymentMethod === 'deposit') {
      setDepositAmount(minDeposit.toFixed(2));
    }
  }, [paymentMethod, minDeposit]);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const amount = paymentMethod === 'deposit'
        ? parseFloat(depositAmount)
        : totalAmount;

      const response = await api.post('/payments/', {
        booking_id: booking.id,
        amount: amount,
        payment_method: paymentMethod,
        currency: 'USD'
      });

      setPaymentDetails(response.data);
      setSuccess(true);

      setTimeout(() => {
        if (onPaymentSuccess) {
          onPaymentSuccess(response.data);
        }
        handleClose();
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Ödeme işlemi başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPaymentMethod('online');
    setDepositAmount('');
    setError('');
    setSuccess(false);
    setPaymentDetails(null);
    onClose();
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'online':
        return <CreditCard />;
      case 'cash':
        return <Money />;
      case 'deposit':
        return <AccountBalance />;
      default:
        return <CreditCard />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        pb: 1
      }}>
        Ödeme Yap
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Ödeme Başarılı!
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  İşlem numaranız: {paymentDetails?.id}
                </Typography>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Booking Summary */}
              <Card sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Rezervasyon Detayları
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Hizmet:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {booking?.service?.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Süre:</Typography>
                    <Typography>{booking?.service?.duration} dk</Typography>
                  </Box>
                  <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Toplam:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      ${totalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Payment Method Selection */}
              <FormControl component="fieldset" fullWidth>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Ödeme Yöntemi Seçin
                </Typography>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <Card sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)' }}>
                    <CardContent>
                      <FormControlLabel
                        value="online"
                        control={<Radio sx={{ color: 'white' }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CreditCard />
                            <Box>
                              <Typography sx={{ fontWeight: 'bold', color: 'white' }}>
                                Kredi Kartı / Banka Kartı
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Güvenli online ödeme
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>

                  <Card sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)' }}>
                    <CardContent>
                      <FormControlLabel
                        value="cash"
                        control={<Radio sx={{ color: 'white' }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Money />
                            <Box>
                              <Typography sx={{ fontWeight: 'bold', color: 'white' }}>
                                Nakit
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Randevu sırasında öde
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>

                  <Card sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)' }}>
                    <CardContent>
                      <FormControlLabel
                        value="deposit"
                        control={<Radio sx={{ color: 'white' }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccountBalance />
                            <Box>
                              <Typography sx={{ fontWeight: 'bold', color: 'white' }}>
                                Kapora
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Minimum ${minDeposit.toFixed(2)} (%10)
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      {paymentMethod === 'deposit' && (
                        <TextField
                          fullWidth
                          type="number"
                          label="Kapora Tutarı"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          inputProps={{
                            min: minDeposit,
                            max: totalAmount,
                            step: 0.01
                          }}
                          sx={{
                            mt: 2,
                            '& .MuiInputBase-root': {
                              color: 'white',
                              bgcolor: 'rgba(255,255,255,0.1)'
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)'
                            }
                          }}
                          helperText={`Min: $${minDeposit.toFixed(2)} - Max: $${totalAmount.toFixed(2)}`}
                        />
                      )}
                    </CardContent>
                  </Card>
                </RadioGroup>
              </FormControl>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {!success && (
          <>
            <Button
              onClick={handleClose}
              sx={{
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handlePayment}
              variant="contained"
              disabled={loading || (paymentMethod === 'deposit' && parseFloat(depositAmount) < minDeposit)}
              startIcon={loading ? <CircularProgress size={20} /> : getPaymentIcon(paymentMethod)}
              sx={{
                bgcolor: 'white',
                color: '#667eea',
                fontWeight: 'bold',
                px: 4,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)'
                }
              }}
            >
              {loading ? 'İşleniyor...' :
                paymentMethod === 'deposit'
                  ? `$${parseFloat(depositAmount || 0).toFixed(2)} Öde`
                  : paymentMethod === 'cash'
                    ? 'Randevuyu Onayla'
                    : `$${totalAmount.toFixed(2)} Öde`
              }
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
