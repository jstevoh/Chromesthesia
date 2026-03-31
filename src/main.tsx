import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initFirebaseAnalytics } from './lib/firebase';
import { initAnalytics } from './lib/analytics';

// Initialize analytics outside the React tree — runs once, no re-renders
initFirebaseAnalytics().then(analyticsInstance => {
  if (analyticsInstance) {
    initAnalytics(analyticsInstance);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
