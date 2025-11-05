import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Checkbox,
  FormGroup,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Person,
  Email,
  Phone,
  Star,
  WorkOutline,
  ContentCut
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = window.API_BASE_URL || process.env.REACT_APP_API_URL || '/api/v1';

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Dialog states
  const [inviteDialog, setInviteDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [servicesDialog, setServicesDialog] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Form states
  const [inviteForm, setInviteForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'worker'
  });

  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    fetchWorkers();
    fetchServices();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('business_token') ||
           localStorage.getItem('access_token') ||
           localStorage.getItem('businessToken');
  };

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/business/workers/`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setWorkers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching workers:', err);
      setError('Failed to load workers');
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/business/my-services`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setServices(response.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchWorkerServices = async (workerId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/business/workers/${workerId}/services`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setSelectedServices(response.data.map(s => s.id));
    } catch (err) {
      console.error('Error fetching worker services:', err);
    }
  };

  const handleInviteWorker = async () => {
    try {
      setError(null);
      const response = await axios.post(
        `${API_BASE_URL}/business/workers/invite`,
        inviteForm,
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );

      setSuccess(response.data.message);
      if (response.data.temp_password) {
        setSuccess(`${response.data.message}. Temp password: ${response.data.temp_password}`);
      }

      setInviteDialog(false);
      setInviteForm({ email: '', first_name: '', last_name: '', role: 'worker' });
      fetchWorkers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to invite worker');
    }
  };

  const handleUpdateWorker = async () => {
    try {
      setError(null);
      await axios.put(
        `${API_BASE_URL}/business/workers/${selectedWorker.id}`,
        {
          role: selectedWorker.role,
          status: selectedWorker.status
        },
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );

      setSuccess('Worker updated successfully');
      setEditDialog(false);
      fetchWorkers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update worker');
    }
  };

  const handleRemoveWorker = async (workerId) => {
    if (!window.confirm('Are you sure you want to remove this worker?')) return;

    try {
      setError(null);
      await axios.delete(`${API_BASE_URL}/business/workers/${workerId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });

      setSuccess('Worker removed successfully');
      fetchWorkers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove worker');
    }
  };

  const handleAssignServices = async () => {
    try {
      setError(null);
      await axios.post(
        `${API_BASE_URL}/business/workers/${selectedWorker.id}/services`,
        selectedServices,
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );

      setSuccess('Services assigned successfully');
      setServicesDialog(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to assign services');
    }
  };

  const openServicesDialog = (worker) => {
    setSelectedWorker(worker);
    fetchWorkerServices(worker.id);
    setServicesDialog(true);
  };

  const openEditDialog = (worker) => {
    setSelectedWorker(worker);
    setEditDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'invited': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Worker Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setInviteDialog(true)}
          sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}
        >
          Invite Worker
        </Button>
      </Box>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Workers List */}
      {workers.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <WorkOutline sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No workers yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Invite workers to help manage your business
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {workers.map((worker) => (
            <Grid item xs={12} md={6} lg={4} key={worker.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={worker.avatar_url}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    >
                      {worker.first_name?.[0]}{worker.last_name?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">
                        {worker.first_name} {worker.last_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {worker.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={worker.status}
                      size="small"
                      color={getStatusColor(worker.status)}
                    />
                    <Chip
                      label={worker.role}
                      size="small"
                      variant="outlined"
                    />
                    {worker.rating > 0 && (
                      <Chip
                        icon={<Star />}
                        label={worker.rating.toFixed(1)}
                        size="small"
                        color="primary"
                      />
                    )}
                  </Box>

                  {worker.phone_number && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <Phone sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                      {worker.phone_number}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<ContentCut />}
                      onClick={() => openServicesDialog(worker)}
                    >
                      Services
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => openEditDialog(worker)}
                    >
                      Edit
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveWorker(worker.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Invite Worker Dialog */}
      <Dialog open={inviteDialog} onClose={() => setInviteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite Worker</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="First Name"
            value={inviteForm.first_name}
            onChange={(e) => setInviteForm({ ...inviteForm, first_name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Last Name"
            value={inviteForm.last_name}
            onChange={(e) => setInviteForm({ ...inviteForm, last_name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              label="Role"
            >
              <MenuItem value="worker">Worker</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleInviteWorker}
            variant="contained"
            disabled={!inviteForm.email}
            sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}
          >
            Invite
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Worker Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Worker</DialogTitle>
        <DialogContent>
          {selectedWorker && (
            <>
              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedWorker.role}
                  onChange={(e) => setSelectedWorker({ ...selectedWorker, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="worker">Worker</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="owner">Owner</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedWorker.status}
                  onChange={(e) => setSelectedWorker({ ...selectedWorker, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="invited">Invited</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateWorker}
            variant="contained"
            sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Services Dialog */}
      <Dialog open={servicesDialog} onClose={() => setServicesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Services to {selectedWorker?.first_name} {selectedWorker?.last_name}
        </DialogTitle>
        <DialogContent>
          <FormGroup>
            {services.map((service) => (
              <FormControlLabel
                key={service.id}
                control={
                  <Checkbox
                    checked={selectedServices.includes(service.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedServices([...selectedServices, service.id]);
                      } else {
                        setSelectedServices(selectedServices.filter(id => id !== service.id));
                      }
                    }}
                  />
                }
                label={`${service.name} - $${service.price} (${service.duration} min)`}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServicesDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAssignServices}
            variant="contained"
            sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#007562' } }}
          >
            Assign Services
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkerManagement;
