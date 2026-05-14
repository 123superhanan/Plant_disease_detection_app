// config/api.config.js
import { Platform } from 'react-native';

export const getApiBaseUrl = () => {
  // Web
  if (Platform.OS === 'web') {
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:5001';
    }
    return ''; // Production relative path
  }

  // Mobile - Android emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001';
  }

  // Mobile - iOS simulator / Physical device
  return 'http://localhost:5001';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;
export const AUTH_URL = `${API_BASE_URL}/api/auth`;
export const DETECT_URL = `${API_BASE_URL}/api/detect`;
export const HISTORY_URL = `${API_BASE_URL}/api/history`;
export const RECOMMENDATION_URL = `${API_BASE_URL}/api/recommendation/predict`;
