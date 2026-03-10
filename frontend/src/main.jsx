// frontend/src/main.jsx
// This is where React starts. It "mounts" our App onto the HTML page.
// The <div id="root"> in index.html becomes the container for ALL of React.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// StrictMode: makes React show extra warnings in development
// (won't affect production build)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
