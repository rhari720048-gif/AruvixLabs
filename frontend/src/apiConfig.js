/**
 * API Host Configuration for AruvixLabs CRM
 * Dynamically resolves local backend URL vs production Render URL
 */
const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.endsWith('.local');

export const API = isLocal 
  ? `http://${hostname}:5000/api` 
  : 'https://aruvixlabs.onrender.com/api';

export default API;
