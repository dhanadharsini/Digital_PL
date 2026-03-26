import React, { createContext, useContext, useState, useEffect } from 'react';

// Import translations
import enTranslations from '../locales/en.json';
import taTranslations from '../locales/ta.json';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState(enTranslations);

  // Load saved language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
      setTranslations(savedLanguage === 'ta' ? taTranslations : enTranslations);
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    setTranslations(newLanguage === 'ta' ? taTranslations : enTranslations);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key) => {
    // Split the key by dots to access nested properties
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        let fallback = enTranslations;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key; // Return the key if no translation found
          }
        }
        return fallback;
      }
    }
    
    return value || key; // Return the key if translation not found
  };

  const value = {
    language,
    changeLanguage,
    t,
    isTamil: language === 'ta',
    isEnglish: language === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
