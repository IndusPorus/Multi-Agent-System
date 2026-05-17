import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


// Ignore Monaco ResizeObserver warnings
const resizeObserverErr = window.console.error;

window.console.error = (...args) => {

  if (
    args[0]?.includes?.(
      "ResizeObserver loop completed"
    )
  ) {
    return;
  }

  resizeObserverErr(...args);
};


const root = ReactDOM.createRoot(
  document.getElementById('root')
);


// Removed React.StrictMode to prevent Monaco warnings
root.render(
  <App />
);


reportWebVitals();