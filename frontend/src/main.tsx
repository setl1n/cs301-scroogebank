import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tailwind.css'
import App from './App.tsx'
import { AuthProvider } from "react-oidc-context";
import config from './config';

// Log current environment for debugging during development
if (config.isDevelopment) {
  console.log('Environment:', config.env);
  console.log('Redirect URI:', config.cognitoConfig.redirect_uri);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...config.cognitoConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
)
