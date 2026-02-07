import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import ReactGA from "react-ga4";

const MEASUREMENT_ID = import.meta.env.VITE_GA_ID; 
if (MEASUREMENT_ID) {
  const ga = (ReactGA as any).default || ReactGA;
  ga.initialize(MEASUREMENT_ID);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

