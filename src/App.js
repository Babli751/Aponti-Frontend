import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, Card, CardContent, Box, Button, Stack } from '@mui/material';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import About from './pages/About';
import Company from './pages/Company';
import Support from './pages/Support';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Settings from './pages/Settings';
import BusinessSignup from './pages/BusinessSignup';
import BusinessDashboard from './pages/BusinessDashboard';
import BarberDashboard from './pages/BarberDashboard';
import BusinessDetail from './pages/BusinessDetail';
import ContactUs from './pages/ContactUs';

// Favorites redirect component
const FavoritesRedirect = () => {
  React.useEffect(() => {
    // Redirect to dashboard with favorite services tab (tab index 1)
    window.location.href = '/dashboard';
  }, []);
  return null;
};

// Debug component for barber authentication
const BarberDebug = () => {
  const [debugInfo, setDebugInfo] = React.useState({});
  const [testResult, setTestResult] = React.useState('');

  React.useEffect(() => {
    const info = {
      access_token: localStorage.getItem('access_token') ? 'PRESENT' : 'MISSING',
      business_token: localStorage.getItem('business_token') ? 'PRESENT' : 'MISSING',
      businessToken: localStorage.getItem('businessToken') ? 'PRESENT' : 'MISSING',
      api_base_url: window.API_BASE_URL,
      current_url: window.location.href
    };
    setDebugInfo(info);
  }, []);

  const testAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setTestResult('❌ No access token found');
      return;
    }

    try {
      const response = await fetch(`${window.API_BASE_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Auth successful: ${JSON.stringify(data)}`);
      } else {
        const error = await response.text();
        setTestResult(`❌ Auth failed (${response.status}): ${error}`);
      }
    } catch (error) {
      setTestResult(`❌ Network error: ${error.message}`);
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('business_token');
    localStorage.removeItem('businessToken');
    setDebugInfo(prev => ({
      ...prev,
      access_token: 'MISSING',
      business_token: 'MISSING',
      businessToken: 'MISSING'
    }));
    setTestResult('🗑️ Tokens cleared');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Barber Authentication Debug</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Token Status</Typography>
          <Box sx={{ mb: 2 }}>
            <Typography><strong>Access Token:</strong> {debugInfo.access_token}</Typography>
            <Typography><strong>Business Token:</strong> {debugInfo.business_token}</Typography>
            <Typography><strong>BusinessToken:</strong> {debugInfo.businessToken}</Typography>
          </Box>
          <Typography><strong>API Base URL:</strong> {debugInfo.api_base_url}</Typography>
          <Typography><strong>Current URL:</strong> {debugInfo.current_url}</Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Test Authentication</Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button variant="contained" onClick={testAuth}>Test Auth API</Button>
            <Button variant="outlined" color="error" onClick={clearTokens}>Clear Tokens</Button>
          </Stack>
          {testResult && (
            <Typography sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              {testResult}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Instructions</Typography>
          <Typography variant="body2" paragraph>
            1. If tokens are missing, go to the signup page and login as a barber.
          </Typography>
          <Typography variant="body2" paragraph>
            2. Click "Test Auth API" to verify authentication works.
          </Typography>
          <Typography variant="body2" paragraph>
            3. If auth fails, check the API response for details.
          </Typography>
          <Typography variant="body2" paragraph>
            4. Try accessing the barber dashboard after successful auth.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

// Professional grey color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2d3748', // Dark charcoal
      light: '#4a5568',
      dark: '#1a202c',
    },
    secondary: {
      main: '#718096', // Soft grey
      light: '#a0aec0',
      dark: '#4a5568',
    },
    background: {
      default: '#ffffff',
      paper: '#f7fafc',
    },
    success: {
      main: '#48bb78',
    },
    warning: {
      main: '#ed8936',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 166, 147, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2d3748',
          color: 'white',
        },
      },
    },
  },
});

// Business için korumalı route bileşeni
const BusinessProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('business_token');
  return token ? children : <Navigate to="/business-signup" replace />;
};

// Barber için korumalı route bileşeni
const BarberProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/business-signup?tab=2" replace />;
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AuthAwareRoutes />
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

// Separate component to access authentication context
function AuthAwareRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* Business Routes */}
      <Route path="/business-signup" element={<BusinessSignup />} />
      <Route 
        path="/business-dashboard" 
        element={
          <BusinessProtectedRoute>
            <BusinessDashboard />
          </BusinessProtectedRoute>
        } 
      />
      <Route path="/BusinessDashboard" element={<Navigate to="/business-dashboard" replace />} />

      {/* Customer Routes */}
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" />}
      />
      <Route
        path="/favorites"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" />}
      />
      <Route
        path="/settings"
        element={isAuthenticated ? <Settings /> : <Navigate to="/signin" />}
      />
      
      {/* Business Routes */}
      <Route path="/business-dashboard" element={<BusinessDashboard />} />
      <Route path="/BusinessDashboard" element={<Navigate to="/business-dashboard" replace />} />
      <Route path="/business/:id" element={<BusinessDetail />} />

      {/* Barber Routes */}
      <Route
        path="/barber-dashboard"
        element={
          <BarberProtectedRoute>
            <BarberDashboard />
          </BarberProtectedRoute>
        }
      />
      <Route path="/barber-debug" element={<BarberDebug />} />
      <Route path="/debug-barber-login.html" element={<BarberDebug />} />
      <Route path="/test-barber-login.html" element={<BarberDebug />} />

      {/* Other Routes */}
      <Route path="/services" element={<Services />} />
      <Route path="/about" element={<About />} />
      <Route path="/company" element={<Company />} />
      <Route path="/support" element={<Support />} />
      <Route path="/contact" element={<ContactUs />} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;