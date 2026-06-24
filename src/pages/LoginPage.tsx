import { useState } from 'react';
import { User, Lock, Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PerfxLogo } from '../assets/PerfxLogo';
import { AnimatedLoginButton } from '../components/ui/AnimatedLoginButton';
import { api } from '../services/api';
import { Smart2FA } from '../components/auth/Smart2FA';

type AuthMode = 'LOGIN' | 'REGISTER' | 'MFA';

export default function LoginPage() {
  const { login, verifyMfa } = useAuth();
  
  // UI State
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [mfaToken, setMfaToken] = useState('');

  // Perfil guardado (Quick Login)
  const [lastProfile, setLastProfile] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('perfx_last_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const formatName = (emailStr: string) => {
    if (!emailStr) return 'Usuario';
    const namePart = emailStr.split('@')[0];
    return namePart.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'admin': return 'DIRECTOR DE OPERACIONES';
      case 'supervisor': return 'SUPERVISOR DE RIESGO';
      case 'guest': return 'USUARIO INVITADO (GUEST)';
      default: return 'ANALISTA DE FRAUDE';
    }
  };

  const resetForm = () => {
    setError('');
    setSuccessMsg('');
    setPassword('');
    setTotpCode('');
  };

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    resetForm();

    let targetEmail = lastProfile ? lastProfile.email : email;
    if (targetEmail && !targetEmail.includes('@')) {
      targetEmail = targetEmail.toLowerCase().replace(/\s+/g, '.') + '@perfx.io';
    }

    if (!targetEmail.trim() || !password.trim()) {
      setError('Todos los campos son requeridos');
      throw new Error('Campos incompletos');
    }

    try {
      const response = await login(targetEmail, password);
      
      if (response && response.nextStep === 'MFA_REQUIRED') {
        // Redirigir a pantalla de MFA
        setMfaToken(response.mfaToken);
        setMode('MFA');
        return; // Detener animación de éxito, el usuario no ha entrado aún
      }

      if (!response) {
        throw new Error('Fallo de autenticación');
      }

      // Login exitoso normal
      localStorage.setItem('perfx_last_profile', JSON.stringify({
        email: response.email,
        role: response.role,
        avatar_url: response.avatar_url
      }));

      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
      throw err;
    }
  };

  const handleRegister = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    resetForm();

    if (!email.trim() || !password.trim() || !name.trim()) {
      setError('Todos los campos son requeridos');
      throw new Error('Campos incompletos');
    }

    try {
      await api.auth.register(name, email, password);
      setMode('LOGIN');
      setSuccessMsg('Cuenta creada exitosamente. Ahora puedes ingresar.');
      setPassword('');
      setName('');
    } catch (err: any) {
      setError(err.message || 'Error al registrar la cuenta');
      throw err;
    }
  };

  const handleMfaVerify = async (e: React.MouseEvent<HTMLButtonElement> | null, codeToVerify?: string) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const code = codeToVerify || totpCode;

    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      throw new Error('Código inválido');
    }

    try {
      const user = await verifyMfa(mfaToken, code);
      if (!user) throw new Error('Validación fallida');

      localStorage.setItem('perfx_last_profile', JSON.stringify({
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url
      }));

      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (err: any) {
      setError(err.message || 'Código inválido');
      throw err;
    }
  };

  const handleBiometricVerify = async (credential: any) => {
    // Aquí en producción mandaríamos el credential al backend para verificar la firma
    // Para la demostración, si tenemos credential, asumimos paso exitoso simulando
    // como si enviáramos el TOTP validado o un token bypass de WebAuthn.
    try {
      console.log('Biometric credential received:', credential);
      // Simulación: usamos un endpoint o lógica que acepte webauthn.
      // Por ahora llamamos verifyMfa simulando un bypass exitoso
      const user = await verifyMfa(mfaToken, '123456'); // Asumimos que el backend lo acepta para la demo
      if (!user) throw new Error('Validación biométrica fallida');

      localStorage.setItem('perfx_last_profile', JSON.stringify({
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url
      }));

      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (err: any) {
      setError(err.message || 'Error en validación biométrica');
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-800 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[800px] bg-white dark:bg-navy-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[480px]">

        {/* Left Panel: Image Cover */}
        <div className="hidden md:block md:w-1/2 relative bg-[#0B104A]">
          <img
            src="/assets/login-bg.png"
            alt="Cybersecurity"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-8 left-8 right-8">
            <div className="bg-white dark:bg-navy-800/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-white shadow-xl transition-all duration-500">
              <p className="text-xs font-bold tracking-[0.2em] text-white/80 mb-2 uppercase">Smart Fraud Engine</p>
              <h2 className="text-2xl font-bold leading-tight">
                {mode === 'REGISTER' ? 'Únete a la plataforma de protección más avanzada.' : 'Control total sobre sus transacciones en tiempo real.'}
              </h2>
            </div>
          </div>
        </div>

        {/* Right Panel: Dynamic Forms */}
        <div className="w-full md:w-1/2 p-8 lg:p-10 flex flex-col justify-center relative bg-white dark:bg-navy-800">
          <div className="mb-8 flex flex-col items-center text-center">
            <PerfxLogo variant="static-dark" className="mb-2" />
            <p className="text-[10px] text-slate-400 mt-1 tracking-widest uppercase font-bold">
              {mode === 'LOGIN' && 'Acceda a su panel operativo'}
              {mode === 'REGISTER' && 'Creación de Cuenta'}
              {mode === 'MFA' && 'Verificación de Seguridad 2FA'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={e => e.preventDefault()}>
            {/* ── MODO: LOGIN ─────────────────────────────────── */}
            {mode === 'LOGIN' && (
              <>
                {successMsg && <p className="text-xs font-semibold text-emerald-500 text-center mb-4">{successMsg}</p>}
                
                {lastProfile ? (
                  <div className="flex flex-col items-center justify-center relative pt-4 pb-2">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl shadow-slate-200/80 overflow-hidden relative z-10 bg-white dark:bg-navy-800 mb-5 transition-transform duration-500 hover:scale-[1.02]">
                      <img src={lastProfile.avatar_url || `https://ui-avatars.com/api/?name=${formatName(lastProfile.email)}&background=0B104A&color=fff&size=250&rounded=true`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight text-center relative z-10">
                      {formatName(lastProfile.email)}
                    </h3>
                    <p className="text-[10px] font-bold text-navy-900 dark:text-white uppercase tracking-widest mt-1 mb-6 relative z-10 text-center">
                      {formatRole(lastProfile.role)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setLastProfile(null);
                        setEmail('');
                        localStorage.removeItem('perfx_last_profile');
                      }}
                      className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-navy-900 dark:hover:text-white dark:text-white transition-colors relative z-10"
                    >
                      Iniciar sesión con otra cuenta
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Identificador
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-slate-400">
                        <User className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-navy-800 text-sm font-medium text-slate-800 dark:text-white rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#0B104A]/20 transition-all border border-slate-100 dark:border-white/10"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Contraseña
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                      <Lock className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-800 text-sm font-medium text-slate-800 dark:text-white rounded-2xl pl-11 pr-11 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#0B104A]/20 transition-all border border-slate-100 dark:border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-xs font-semibold text-coral-500 text-center">{error}</p>}
                
                <AnimatedLoginButton onClick={handleLogin} />
                
                <div className="flex items-center justify-center gap-2 pt-2">
                  <p className="text-xs text-slate-500">¿No tienes cuenta?</p>
                  <button 
                    type="button" 
                    onClick={() => { setMode('REGISTER'); resetForm(); }}
                    className="text-xs font-bold text-[#F97E00] hover:underline"
                  >
                    Regístrate aquí
                  </button>
                </div>
              </>
            )}

            {/* ── MODO: REGISTRO ─────────────────────────────────── */}
            {mode === 'REGISTER' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Nombre Completo
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                      <User className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <input
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={name}
                      onChange={e => {
                        setName(e.target.value);
                        const parts = e.target.value.trim().split(/\s+/);
                        if (parts.length >= 2) {
                          const base = `${parts[0].toLowerCase()}.${parts[parts.length-1].toLowerCase()}`;
                          setEmail(`${base}@perfx.io`);
                        } else if (parts.length === 1 && parts[0]) {
                          setEmail(`${parts[0].toLowerCase()}@perfx.io`);
                        } else {
                          setEmail('');
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-navy-800 text-sm font-medium text-slate-800 dark:text-white rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#0B104A]/20 transition-all border border-slate-100 dark:border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Identificador Generado
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                      <Mail className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <input
                      type="text"
                      readOnly
                      placeholder="Se generará automáticamente"
                      value={email ? email.replace('@perfx.io', '') : ''}
                      className="w-full bg-slate-100 dark:bg-navy-800 text-sm font-bold font-mono text-slate-800 dark:text-white rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none border border-slate-200 dark:border-white/10 cursor-not-allowed opacity-80"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                      <Lock className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-800 text-sm font-medium text-slate-800 dark:text-white rounded-2xl pl-11 pr-11 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#0B104A]/20 transition-all border border-slate-100 dark:border-white/10"
                    />
                  </div>
                </div>

                {error && <p className="text-xs font-semibold text-coral-500 text-center">{error}</p>}
                
                <AnimatedLoginButton onClick={handleRegister} label="Crear Cuenta" />

                <div className="flex items-center justify-center pt-2">
                  <button 
                    type="button" 
                    onClick={() => { setMode('LOGIN'); resetForm(); }}
                    className="text-xs font-bold text-slate-400 hover:text-navy-900 dark:hover:text-white dark:text-white flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" /> Volver al Login
                  </button>
                </div>
              </>
            )}

            {/* ── MODO: MFA ──────────────────────────────────────── */}
            {mode === 'MFA' && (
              <div className="flex flex-col items-center animate-fade-in w-full">
                <Smart2FA 
                  onVerifyTOTP={(code) => {
                    setTotpCode(code);
                    handleMfaVerify(null as any, code);
                  }}
                  onVerifyBiometric={handleBiometricVerify}
                  isProcessing={false} // Podrías enlazar a un estado de loading
                />

                {error && <p className="text-xs font-semibold text-coral-500 text-center mt-4">{error}</p>}

                <div className="flex items-center justify-center pt-6">
                  <button 
                    type="button" 
                    onClick={() => { setMode('LOGIN'); resetForm(); }}
                    className="text-xs font-bold text-slate-400 hover:text-navy-900 dark:hover:text-white dark:text-white flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" /> Cancelar
                  </button>
                </div>
              </div>
            )}

          </form>

          <div className="mt-auto pt-8">
            <p className="text-[9px] text-slate-400 text-center uppercase font-bold tracking-widest">
              © 2026 PERFX SYSTEM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}