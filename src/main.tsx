
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeStorage } from './services/storageService.ts'

// Initialize Supabase storage buckets
initializeStorage().catch(console.error);

// Make sure we're creating the root and rendering properly
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
