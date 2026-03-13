import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AppProvider } from './context/AppContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'
import App from './App.jsx'

// Standard client ID for this setup
const GOOGLE_CLIENT_ID = "881320112110-add2ssp2tsisddg1853koj85hqjhr4ac.apps.googleusercontent.com"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppProvider>
        <LanguageProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </LanguageProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
