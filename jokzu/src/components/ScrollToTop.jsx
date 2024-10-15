// src/components/ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    console.log('Navigated to:', pathname); // Log the current pathname
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
