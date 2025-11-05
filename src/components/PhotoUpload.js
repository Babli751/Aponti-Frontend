import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Typography,
  Card
} from '@mui/material';
import {
  PhotoCamera,
  Delete,
  CloudUpload
} from '@mui/icons-material';

const PhotoUpload = ({
  currentPhoto,
  onUploadSuccess,
  uploadEndpoint,
  type = 'avatar', // 'avatar', 'cover', 'photo'
  shape = 'circle', // 'circle', 'square', 'wide'
  size = 'medium', // 'small', 'medium', 'large'
  label = 'Upload Photo'
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(currentPhoto);
  const fileInputRef = useRef(null);

  // Size configurations
  const sizeConfig = {
    avatar: {
      small: { width: 80, height: 80 },
      medium: { width: 120, height: 120 },
      large: { width: 200, height: 200 }
    },
    cover: {
      small: { width: 300, height: 150 },
      medium: { width: 600, height: 300 },
      large: { width: 900, height: 450 }
    },
    photo: {
      small: { width: 200, height: 200 },
      medium: { width: 300, height: 300 },
      large: { width: 400, height: 400 }
    }
  };

  const dimensions = sizeConfig[type][size];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('business_token') ||
                    localStorage.getItem('access_token') ||
                    localStorage.getItem('businessToken');

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }

      setPreview(data.avatar_url || data.cover_photo_url || data.photo_url);
      setUploading(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload photo');
      setUploading(false);
    }
  };

  const handleDelete = () => {
    setPreview(null);
    if (onUploadSuccess) {
      onUploadSuccess({ avatar_url: null, cover_photo_url: null, photo_url: null });
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Render based on shape
  if (shape === 'circle') {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Avatar
            src={preview}
            sx={{
              width: dimensions.width,
              height: dimensions.height,
              cursor: 'pointer',
              border: '4px solid #f0f0f0',
              '&:hover': { opacity: 0.8 }
            }}
            onClick={handleClick}
          >
            {!preview && <PhotoCamera sx={{ fontSize: 40, color: '#999' }} />}
          </Avatar>

          {uploading && (
            <CircularProgress
              size={dimensions.width}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1
              }}
            />
          )}

          {preview && !uploading && (
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': { bgcolor: 'error.dark' }
              }}
              onClick={handleDelete}
            >
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          {label}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    );
  }

  // Wide/Square cover photo
  return (
    <Box>
      <Card
        sx={{
          width: dimensions.width,
          height: dimensions.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#f5f5f5',
          backgroundImage: preview ? `url(${preview})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&:hover': { opacity: 0.9 }
        }}
        onClick={handleClick}
      >
        {!preview && !uploading && (
          <Box sx={{ textAlign: 'center' }}>
            <CloudUpload sx={{ fontSize: 60, color: '#999', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
        )}

        {uploading && <CircularProgress />}

        {preview && !uploading && (
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': { bgcolor: 'error.dark' }
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        )}
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default PhotoUpload;
