import api from './api';

// Generate or get visitor ID from localStorage
const getVisitorId = () => {
  let visitorId = localStorage.getItem('aponti_visitor_id');
  if (!visitorId) {
    visitorId = 'v_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('aponti_visitor_id', visitorId);
  }
  return visitorId;
};

// Session ID for current browser session
let currentSessionId = sessionStorage.getItem('aponti_session_id');

// Start a new session
const startSession = async () => {
  if (currentSessionId) {
    return currentSessionId;
  }

  try {
    const response = await api.post('/analytics/track/session', {
      visitor_id: getVisitorId(),
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      landing_page: window.location.pathname
    });

    currentSessionId = response.data.session_id;
    sessionStorage.setItem('aponti_session_id', currentSessionId);

    console.log('📊 Analytics session started:', currentSessionId);
    return currentSessionId;
  } catch (error) {
    console.error('Failed to start analytics session:', error);
    return null;
  }
};

// Track page view
const trackPageView = async (pagePath, pageTitle) => {
  if (!currentSessionId) {
    await startSession();
  }

  if (!currentSessionId) return;

  try {
    await api.post('/analytics/track/pageview', {
      session_id: currentSessionId,
      page_path: pagePath || window.location.pathname,
      page_title: pageTitle || document.title
    });
    console.log('📊 Page view tracked:', pagePath || window.location.pathname);
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

// Track click event
const trackClick = async (elementId, elementText, elementType, pagePath) => {
  if (!currentSessionId) {
    await startSession();
  }

  if (!currentSessionId) return;

  try {
    await api.post('/analytics/track/click', {
      session_id: currentSessionId,
      element_id: elementId,
      element_text: elementText,
      element_type: elementType || 'button',
      page_path: pagePath || window.location.pathname
    });
    console.log('📊 Click tracked:', elementText || elementId);
  } catch (error) {
    console.error('Failed to track click:', error);
  }
};

// Higher-order function to wrap click handlers with tracking
const withClickTracking = (handler, elementId, elementText, elementType = 'button') => {
  return async (...args) => {
    trackClick(elementId, elementText, elementType);
    if (handler) {
      return handler(...args);
    }
  };
};

// Initialize analytics on app load
const initAnalytics = async () => {
  await startSession();
  trackPageView();
};

// Export analytics functions
const analyticsService = {
  initAnalytics,
  startSession,
  trackPageView,
  trackClick,
  withClickTracking,
  getVisitorId,
  getCurrentSessionId: () => currentSessionId
};

export default analyticsService;
