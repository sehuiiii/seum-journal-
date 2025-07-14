import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Tailwind CSS를 사용하고 있다면 여기에 임포트
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);