import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { MCCProvider } from './context/MCCContext';
import { RulesProvider } from './context/RulesContext';
import { ConfirmProvider } from './context/ConfirmContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <MCCProvider>
        <RulesProvider>
          <ConfirmProvider>
            <App />
          </ConfirmProvider>
        </RulesProvider>
      </MCCProvider>
    </AuthProvider>
  </StrictMode>,
);
