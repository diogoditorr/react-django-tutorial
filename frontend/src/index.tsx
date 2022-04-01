import App from './components/App';
import React from 'react';
import ReactDOM from 'react-dom/client';
import '../public/css/index.css';

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);