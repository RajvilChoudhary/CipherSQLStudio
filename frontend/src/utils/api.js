// frontend/src/utils/api.js
// Centralized API calls using axios
// All backend communication goes through here

import axios from 'axios';

// Base URL: In dev, Vite proxy forwards /api to localhost:5000
// In production, set VITE_API_URL in your .env
const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: runs before every request
apiClient.interceptors.request.use(config => {
  // Add session ID to every request automatically
  const sessionId = getOrCreateSessionId();
  config.headers['x-session-id'] = sessionId;
  return config;
});

// Response interceptor: runs on every response
apiClient.interceptors.response.use(
  response => response.data, // Unwrap .data so callers get data directly
  error => {
    const message = error.response?.data?.message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

// ================================================
// SESSION ID MANAGEMENT
// Each browser gets a unique ID to track their sandbox
// ================================================
export const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem('cipher_session_id');
  if (!sessionId) {
    // Generate a random session ID: "cipher_" + random 16-char hex string
    sessionId = 'cipher_' + Array.from(
      crypto.getRandomValues(new Uint8Array(8)),
      b => b.toString(16).padStart(2, '0')
    ).join('');
    localStorage.setItem('cipher_session_id', sessionId);
  }
  return sessionId;
};

// ================================================
// API FUNCTIONS
// ================================================

// Get all assignments (for listing page)
export const fetchAssignments = () => 
  apiClient.get('/assignments');

// Get single assignment by ID (for attempt page)
export const fetchAssignment = (id) => 
  apiClient.get(`/assignments/${id}`);

// Execute a SQL query
export const executeQuery = (assignmentId, query) => 
  apiClient.post('/query/execute', {
    assignmentId,
    query,
    sessionId: getOrCreateSessionId()
  });

// Get AI hint
export const getHint = (assignmentId, currentQuery, errorMessage) =>
  apiClient.post('/query/hint', {
    assignmentId,
    currentQuery,
    errorMessage,
    sessionId: getOrCreateSessionId()
  });

// Get saved progress
export const getProgress = (assignmentId) =>
  apiClient.get(`/query/progress/${assignmentId}`, {
    params: { sessionId: getOrCreateSessionId() }
  });

export default apiClient;
