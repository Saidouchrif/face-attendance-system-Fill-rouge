import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// Ensure TailwindCSS is loaded via CDN for utility classes
if (typeof document !== 'undefined' && !document.querySelector('script[data-tailwind-cdn]')) {
  const tailwindScript = document.createElement('script');
  tailwindScript.src = 'https://cdn.tailwindcss.com';
  tailwindScript.async = true;
  tailwindScript.setAttribute('data-tailwind-cdn', 'true');
  document.head.appendChild(tailwindScript);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
