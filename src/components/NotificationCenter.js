import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  CheckCircle,
  Schedule,
  Cancel,
  Info,
  DeleteOutline
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = window.API_BASE_URL || process.env.REACT_APP_API_URL || 'http://206.189.57.55:8001/api/v1';

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('business_token') ||
           localStorage.getItem('access_token') ||
           localStorage.getItem('businessToken');
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/user`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/count/unread`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (!anchorEl) {
      fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      fetchNotifications();
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_confirmation':
        return <CheckCircle sx={{ color: '#10b981' }} />;
      case 'reminder':
        return <Schedule sx={{ color: '#f59e0b' }} />;
      case 'status_change':
        return <Info sx={{ color: '#3b82f6' }} />;
      case 'promotion':
        return <NotificationsActive sx={{ color: '#8b5cf6' }} />;
      default:
        return <Notifications sx={{ color: '#6b7280' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_confirmation': return '#d1fae5';
      case 'reminder': return '#fef3c7';
      case 'status_change': return '#dbeafe';
      case 'promotion': return '#ede9fe';
      default: return '#f3f4f6';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: unreadCount > 0 ? '#2d3748' : 'inherit',
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <motion.div
            animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 3 }}
          >
            <Notifications />
          </motion.div>
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            borderRadius: 2,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead} sx={{ textTransform: 'none' }}>
              Mark all read
            </Button>
          )}
        </Box>

        <Divider />

        {/* Notifications List */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Notifications sx={{ fontSize: 60, color: '#e5e7eb', mb: 2 }} />
              <Typography color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ListItem
                      sx={{
                        bgcolor: notification.is_read ? 'transparent' : getNotificationColor(notification.type),
                        borderLeft: notification.is_read ? 'none' : '4px solid #2d3748',
                        transition: 'all 0.3s',
                        '&:hover': {
                          bgcolor: '#f9fafb',
                        },
                        cursor: 'pointer'
                      }}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'white' }}>
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: notification.is_read ? 400 : 600 }}>
                              {notification.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(notification.created_at)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {notification.message}
                          </Typography>
                        }
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        sx={{ ml: 1 }}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>
          )}
        </Box>
      </Menu>
    </>
  );
};

export default NotificationCenter;
