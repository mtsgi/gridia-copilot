/* @refresh reload */
import { render } from 'solid-js/web'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')

render(() => <App />, root!)

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;
    
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

