import { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PerfxLogo } from '../assets/PerfxLogo';
import { AnimatedLoginButton } from '../components/ui/AnimatedLoginButton';

export default function LoginPage() {
  const { login } = useAuth();
  const [lastProfile, setLastProfile] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('perfx_last_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [username, setUsername] = useState(() => lastProfile?.username || localStorage.getItem('perfx_last_username') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const formatName = (email: string) => {
    if (!email) return 'Usuario';
    const namePart = email.split('@')[0];
    return namePart.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'admin': return 'DIRECTOR DE OPERACIONES';
      case 'supervisor': return 'SUPERVISOR DE RIESGO';
      default: return 'ANALISTA DE FRAUDE';
    }
  };

  // Nueva función adaptada para el botón animado
  const handleLoginAttempt = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Todos los campos son requeridos');
      throw new Error('Campos incompletos'); // Dispara la animación de error
    }

    const user = await login(username, password);

    if (!user) {
      setError('Credenciales inválidas');
      throw new Error('Fallo de autenticación'); // Dispara la animación de error
    }

    // Si es exitoso, guardamos el perfil
    localStorage.setItem('perfx_last_profile', JSON.stringify({
      username,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url
    }));

    // Pequeño retraso intencional (800ms) para que el usuario pueda ver
    // la animación verde de "ACCESO APROBADO" antes de que el router lo saque de la vista.
    await new Promise(resolve => setTimeout(resolve, 800));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[800px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[480px]">

        {/* Left Panel: Image Cover */}
        <div className="hidden md:block md:w-1/2 relative bg-[#0B104A]">
          <img
            src="/assets/login-bg.png"
            alt="Cybersecurity"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-8 left-8 right-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-white shadow-xl">
              <p className="text-xs font-bold tracking-[0.2em] text-white/80 mb-2 uppercase">Smart Fraud Engine</p>
              <h2 className="text-2xl font-bold leading-tight">Control total sobre sus transacciones en tiempo real.</h2>
            </div>
          </div>
        </div>

        {/* Right Panel: Login Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-10 flex flex-col justify-center relative bg-white">
          <div className="mb-8 flex flex-col items-center text-center">
            <PerfxLogo variant="static-dark" className="mb-2" />
            <p className="text-[10px] text-slate-400 mt-1 tracking-widest uppercase font-bold">
              Ingrese a su panel operativo
            </p>
          </div>

          <form className="space-y-6">
            {lastProfile ? (
              <div className="flex flex-col items-center justify-center relative pt-4 pb-2">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl shadow-slate-200/80 overflow-hidden relative z-10 bg-white mb-5 transition-transform duration-500 hover:scale-[1.02]">
                  <img src={lastProfile.avatar_url || `https://ui-avatars.com/api/?name=${formatName(lastProfile.email)}&background=0B104A&color=fff&size=250&rounded=true`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight text-center relative z-10">
                  {formatName(lastProfile.email)}
                </h3>
                <p className="text-[10px] font-bold text-[#0B104A] uppercase tracking-widest mt-1 mb-6 relative z-10 text-center">
                  {formatRole(lastProfile.role)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLastProfile(null);
                    setUsername('');
                    localStorage.removeItem('perfx_last_profile');
                  }}
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-[#0B104A] transition-colors relative z-10"
                >
                  Ingresar con otra cuenta
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
                    type="text"
                    placeholder="Documento o Usuario"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-slate-50 text-sm font-medium text-slate-800 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#0B104A]/20 transition-all border border-slate-100"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Contraseña
                </label>
                <button type="button" className="text-[10px] font-bold text-[#0B104A] uppercase tracking-wider hover:underline">
                  ¿Olvidó la clave?
                </button>
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
                  className="w-full bg-slate-50 text-sm font-medium text-slate-800 rounded-2xl pl-11 pr-11 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#0B104A]/20 transition-all border border-slate-100"
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

            {/* AQUÍ ESTÁ EL NUEVO BOTÓN */}
            <AnimatedLoginButton onClick={handleLoginAttempt} />

          </form>

          <div className="mt-auto pt-10">
            <p className="text-[9px] text-slate-400 text-center uppercase font-bold tracking-widest">
              © 2026 PERFX SYSTEM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}