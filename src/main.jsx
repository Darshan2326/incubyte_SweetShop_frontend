import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import { SpeedInsights } from "@vercel/speed-insights/react"
// import Login from './auth/login.jsx'
// import Register from './auth/register.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <SpeedInsights /> */}
    <App />
  </StrictMode>,
)
