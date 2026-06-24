import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!user || !user.id) {
      setError('Error de sesión, inicie sesión nuevamente');
      return;
    }

    setLoading(true);
    try {
      await api.users.update(user.id, { password: newPassword });
      
      // Update local storage user state to remove mustChangePassword
      const updatedUser = { ...user, mustChangePassword: false };
      localStorage.setItem('perfx_user', JSON.stringify(updatedUser));
      
      // Wait, we need to refresh context. A simple way is to re-login with the new password.
      await login(user.email, newPassword);
      
      toast.success('Clave actualizada con éxito');
      navigate('/evaluate');
    } catch (err) {
      setError((err as Error).message || 'Error al actualizar la contraseña');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-800 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[500px] bg-white dark:bg-navy-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-10 lg:p-14 relative">
        <div className="mb-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-coral-500 mx-auto flex items-center justify-center mb-5 shadow-soft-md shadow-coral-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Cambio de Clave Obligatorio
          </h1>
          <p className="text-[11px] text-slate-500 mt-2 tracking-widest uppercase font-bold leading-relaxed">
            Por seguridad, debe actualizar su clave por defecto antes de continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Nueva Contraseña
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <Lock className="w-4 h-4" strokeWidth={2} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-800 text-sm font-medium text-slate-800 dark:text-white rounded-2xl pl-11 pr-11 py-3.5 focus:outline-none focus:ring-2 focus:ring-coral-500/20 transition-all border border-slate-100 dark:border-white/10"
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

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Confirmar Contraseña
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <Lock className="w-4 h-4" strokeWidth={2} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Repetir nueva clave"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-800 text-sm font-medium text-slate-800 dark:text-white rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-coral-500/20 transition-all border border-slate-100 dark:border-white/10"
              />
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-coral-500 text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs uppercase tracking-wider rounded-2xl py-4 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 shadow-lg shadow-coral-500/30"
          >
            {loading ? 'Actualizando...' : 'Actualizar Clave y Entrar'}
            {!loading && <ArrowRight className="w-4 h-4" strokeWidth={2.5} />}
          </button>
        </form>
      </div>
    </div>
  );
}
