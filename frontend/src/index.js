import React from 'react';
import ReactDOM from 'react-dom/client'; // Use createRoot for React 18+
import './styles/index.css'; // Import global styles (including Tailwind)
import App from './App'; // Import the root App component

// Find the root DOM element
const rootElement = document.getElementById('root');
// Create a React root attached to the DOM element
const root = ReactDOM.createRoot(rootElement);

// Render the application within StrictMode for development checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);