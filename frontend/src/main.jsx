// Alias localStorage to sessionStorage to keep tabs isolated
Object.defineProperty(window, 'localStorage', {
  value: window.sessionStorage,
  writable: false
});

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
