import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './styles/mobile.css';
import './styles/mobile-fixes.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import MobileOptimizations from './components/common/MobileOptimizations.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <App />
        <MobileOptimizations />
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>,
);