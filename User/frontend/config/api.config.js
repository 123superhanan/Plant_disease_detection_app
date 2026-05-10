// config/api.config.js
import { Platform } from 'react-native';

export const getApiUrl = () => {
  // Web
  if (Platform.OS === 'web') {
    // For web development (Vite/React)
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:5001/api/detect';
    }
    return '/api/detect'; // Production relative path
  }

  // Mobile
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api/detect';
  }

  // iOS
  return 'http://localhost:5001/api/detect';
};
