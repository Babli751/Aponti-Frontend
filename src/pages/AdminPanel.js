import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Grid, Card, CardContent,
  TextField, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs, Tab, CircularProgress, Alert,
  AppBar, Toolbar, IconButton, Chip, LinearProgress
} from '@mui/material';
import {
  Dashboard, People, Business, AttachMoney, Visibility,
  MouseOutlined, Public, DevicesOther, Logout, TrendingUp,
  Today, DateRange, CalendarMonth
} from '@mui/icons-material';
import api from '../services/api';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Login state
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // Dashboard data
  const [overview, setOverview] = useState(null);
  const [visitorsByCountry, setVisitorsByCountry] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [clickStats, setClickStats] = useState([]);
  const [deviceStats, setDeviceStats] = useState([]);
  const [browserStats, setBrowserStats] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [usersList, setUsersList] = useState({ total: 0, users: [] });
  const [businessesList, setBusinessesList] = useState({ total: 0, businesses: [] });
  const [visitorsTimeline, setVisitorsTimeline] = useState([]);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsLoggedIn(true);
      fetchAllData();
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/analytics/admin/login', loginData);
      localStorage.setItem('admin_token', response.data.access_token);
      setIsLoggedIn(true);
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        overviewRes,
        countryRes,
        pagesRes,
        clicksRes,
        devicesRes,
        browsersRes,
        sessionsRes,
        usersRes,
        businessesRes,
        timelineRes
      ] = await Promise.all([
        api.get('/analytics/admin/dashboard/overview'),
        api.get('/analytics/admin/dashboard/visitors-by-country'),
        api.get('/analytics/admin/dashboard/top-pages'),
        api.get('/analytics/admin/dashboard/click-stats'),
        api.get('/analytics/admin/dashboard/device-stats'),
        api.get('/analytics/admin/dashboard/browser-stats'),
        api.get('/analytics/admin/dashboard/recent-sessions'),
        api.get('/analytics/admin/dashboard/users-list'),
        api.get('/analytics/admin/dashboard/businesses-list'),
        api.get('/analytics/admin/dashboard/visitors-timeline?days=30')
      ]);

      setOverview(overviewRes.data);
      setVisitorsByCountry(countryRes.data);
      setTopPages(pagesRes.data);
      setClickStats(clicksRes.data);
      setDeviceStats(devicesRes.data);
      setBrowserStats(browsersRes.data);
      setRecentSessions(sessionsRes.data);
      setUsersList(usersRes.data);
      setBusinessesList(businessesRes.data);
      setVisitorsTimeline(timelineRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Login form
  if (!isLoggedIn) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
              Admin Panel
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
              Aponti Analytics Dashboard
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TextField
              fullWidth
              label="Username"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              sx={{ mb: 3 }}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              disabled={loading || !loginData.username || !loginData.password}
              sx={{ bgcolor: '#2d3748', '&:hover': { bgcolor: '#1a202c' } }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Stat card component
  const StatCard = ({ title, value, icon, color = '#2d3748', subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>{value}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
          <Box sx={{ bgcolor: color, borderRadius: 2, p: 1, color: 'white' }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#2d3748' }}>
        <Toolbar>
          <Dashboard sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Aponti Admin Panel
          </Typography>
          <Button color="inherit" onClick={fetchAllData} sx={{ mr: 2 }}>
            Refresh
          </Button>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      {loading && <LinearProgress />}

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable">
            <Tab icon={<Dashboard />} label="Overview" />
            <Tab icon={<Visibility />} label="Visitors" />
            <Tab icon={<MouseOutlined />} label="Clicks" />
            <Tab icon={<People />} label="Users" />
            <Tab icon={<Business />} label="Businesses" />
          </Tabs>
        </Paper>

        {/* OVERVIEW TAB */}
        {activeTab === 0 && overview && (
          <Grid container spacing={3}>
            {/* Main Stats */}
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Visitors"
                value={overview.visitors.total.toLocaleString()}
                icon={<People />}
                color="#3b82f6"
                subtitle={`${overview.visitors.today} today`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Page Views"
                value={overview.pageviews.total.toLocaleString()}
                icon={<Visibility />}
                color="#10b981"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Registered Users"
                value={overview.users.total.toLocaleString()}
                icon={<People />}
                color="#8b5cf6"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Revenue"
                value={`$${overview.revenue.total.toLocaleString()}`}
                icon={<AttachMoney />}
                color="#f59e0b"
              />
            </Grid>

            {/* Secondary Stats */}
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Businesses"
                value={overview.businesses.total}
                icon={<Business />}
                color="#ec4899"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Bookings"
                value={overview.bookings.total.toLocaleString()}
                icon={<CalendarMonth />}
                color="#06b6d4"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="New Visitors"
                value={overview.visitors.new.toLocaleString()}
                icon={<TrendingUp />}
                color="#84cc16"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Returning Visitors"
                value={overview.visitors.returning.toLocaleString()}
                icon={<DateRange />}
                color="#f97316"
              />
            </Grid>

            {/* Visitors by Country */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <Public sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Visitors by Country
                </Typography>
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Country</TableCell>
                        <TableCell align="right">Visitors</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visitorsByCountry.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.country}</TableCell>
                          <TableCell align="right">{row.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Top Pages */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <Visibility sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Top Pages
                </Typography>
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Page</TableCell>
                        <TableCell align="right">Views</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topPages.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.page}</TableCell>
                          <TableCell align="right">{row.views}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Device Stats */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <DevicesOther sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Devices
                </Typography>
                {deviceStats.map((d, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Chip label={d.device} size="small" />
                    <Typography>{d.count}</Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>

            {/* Browser Stats */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Browsers
                </Typography>
                {browserStats.map((b, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Chip label={b.browser} size="small" variant="outlined" />
                    <Typography>{b.count}</Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>

            {/* Click Stats */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <MouseOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Top Clicks
                </Typography>
                {clickStats.slice(0, 10).map((c, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>{c.element}</Typography>
                    <Typography>{c.clicks}</Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* VISITORS TAB */}
        {activeTab === 1 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Visitor Sessions</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>IP</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Device</TableCell>
                    <TableCell>Browser</TableCell>
                    <TableCell>Landing Page</TableCell>
                    <TableCell>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentSessions.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell>{s.created_at ? new Date(s.created_at).toLocaleString() : '-'}</TableCell>
                      <TableCell>{s.ip_address}</TableCell>
                      <TableCell>{s.country}</TableCell>
                      <TableCell>{s.city}</TableCell>
                      <TableCell>{s.device}</TableCell>
                      <TableCell>{s.browser}</TableCell>
                      <TableCell>{s.landing_page}</TableCell>
                      <TableCell>
                        <Chip
                          label={s.is_returning ? 'Returning' : 'New'}
                          size="small"
                          color={s.is_returning ? 'primary' : 'success'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* CLICKS TAB */}
        {activeTab === 2 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Click Events</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Element</TableCell>
                    <TableCell align="right">Clicks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clickStats.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell>{c.element}</TableCell>
                      <TableCell align="right">{c.clicks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* USERS TAB */}
        {activeTab === 3 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Registered Users ({usersList.total} total)
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Registered</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersList.users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.id}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.name || '-'}</TableCell>
                      <TableCell>{u.phone || '-'}</TableCell>
                      <TableCell>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          color={u.is_active ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* BUSINESSES TAB */}
        {activeTab === 4 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Businesses ({businessesList.total} total)
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Category</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {businessesList.businesses.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.id}</TableCell>
                      <TableCell>{b.name}</TableCell>
                      <TableCell>{b.owner}</TableCell>
                      <TableCell>{b.email}</TableCell>
                      <TableCell>{b.phone || '-'}</TableCell>
                      <TableCell>{b.city || '-'}</TableCell>
                      <TableCell>
                        <Chip label={b.category || 'Other'} size="small" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AdminPanel;
