import React, { useState, useEffect } from 'react';
import { Fingerprint, Lock, ChevronRight } from 'lucide-react';
// import { startAuthentication } from '@simplewebauthn/browser'; // Para producción

interface Smart2FAProps {
  onVerifyTOTP: (code: string) => void;
  onVerifyBiometric: (credential: any) => void;
  isProcessing?: boolean;
}

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Simulación de WebAuthn
const mockStartAuthentication = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: 'mock-credential-id', rawId: 'mock-raw-id', type: 'public-key' });
    }, 1500);
  });
};

export const Smart2FA: React.FC<Smart2FAProps> = ({ onVerifyTOTP, onVerifyBiometric, isProcessing = false }) => {
  const [authMode, setAuthMode] = useState<'TOTP' | 'BIOMETRIC'>('TOTP');
  const [totpCode, setTotpCode] = useState('');
  const [checkingHardware, setCheckingHardware] = useState(true);

  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        if (isMobileDevice() && window.PublicKeyCredential) {
          const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          if (isAvailable) {
            setAuthMode('BIOMETRIC');
          }
        }
      } catch (err) {
        console.error('Error verificando hardware biométrico', err);
      } finally {
        setCheckingHardware(false);
      }
    };

    checkBiometrics();
  }, []);

  const handleBiometricAuth = async () => {
    try {
      // Reemplazar mockStartAuthentication con startAuthentication(opciones) en prod
      const credential = await mockStartAuthentication();
      onVerifyBiometric(credential);
    } catch (err) {
      console.error('Error en autenticación biométrica:', err);
      // Fallback a TOTP si falla la biometría o el usuario la cancela
      setAuthMode('TOTP');
    }
  };

  const handleTotpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length === 6) {
      onVerifyTOTP(totpCode);
    }
  };

  if (checkingHardware) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-[#0B104A] p-8 rounded-3xl shadow-2xl relative overflow-hidden text-white">
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">
        {authMode === 'BIOMETRIC' ? (
          <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(99,102,241,0.3)] animate-pulse">
              <Fingerprint className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">Verifica tu Identidad</h3>
            <p className="text-sm text-indigo-200 text-center mb-8">
              Usa el sensor biométrico de tu dispositivo para acceder de forma segura.
            </p>
            
            <button
              onClick={handleBiometricAuth}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 group"
            >
              {isProcessing ? 'Verificando...' : 'Toca para verificar'}
              {!isProcessing && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>

            <button 
              onClick={() => setAuthMode('TOTP')}
              className="mt-6 text-sm font-medium text-indigo-300 hover:text-white transition-colors"
            >
              Usar código manual en su lugar
            </button>
          </div>
        ) : (
          <form onSubmit={handleTotpSubmit} className="flex flex-col items-center w-full animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 backdrop-blur-sm">
              <Lock className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">Autenticador</h3>
            <p className="text-sm text-indigo-200 text-center mb-8">
              Ingresa el código de 6 dígitos de tu app autenticadora.
            </p>

            <div className="w-full space-y-4">
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={totpCode}
                onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-black/30 border border-white/10 text-center tracking-[0.7em] text-2xl font-mono font-bold text-white rounded-2xl py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all placeholder:text-white/20"
                autoFocus
              />
              
              <button
                type="submit"
                disabled={totpCode.length !== 6 || isProcessing}
                className="w-full bg-white text-[#0B104A] hover:bg-slate-100 disabled:bg-white/50 disabled:cursor-not-allowed font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-black/20"
              >
                {isProcessing ? 'Verificando...' : 'Verificar Código'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
