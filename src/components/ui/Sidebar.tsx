import { NavLink } from 'react-router-dom';
import { Shield, Search, Settings, LogOut, Users, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { PerfxLogo } from '../../assets/PerfxLogo';

const navItems = [
  { to: '/evaluate', icon: Shield, label: 'Evaluador' },
  { to: '/mcc', icon: Search, label: 'Catálogo MCC' },
  { to: '/rules', icon: Settings, label: 'Reglas' },
  { to: '/users', icon: Users, label: 'Equipo' },
  { to: '/audit', icon: FileText, label: 'Auditoría Forense' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const formatName = (email: string | undefined) => {
    if (!email) return 'Usuario';
    const namePart = email.split('@')[0];
    return namePart.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  };

  return (
    <motion.aside 
      initial={{ x: -300, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      transition={{ type: 'spring', bounce: 0, duration: 0.5, delay: 0.1 }}
      className="hidden lg:flex fixed left-4 top-4 bottom-4 w-64 bg-navy-900/95 backdrop-blur-2xl rounded-3xl flex-col z-40 shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/10 overflow-hidden"
    >
      <div className="flex flex-col h-full">
        <div className="p-5 border-b border-white/10 flex items-center justify-center w-full">
          <PerfxLogo variant="static" className="mx-auto" />
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ease-in-out
                ${isActive
                  ? 'bg-blue-500/15 text-blue-400 shadow-inner border border-blue-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 mb-3 p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-navy-900 flex items-center justify-center text-sm font-bold text-white overflow-hidden border border-navy-900">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.email?.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{formatName(user?.email)}</p>
              <p className="text-[10px] text-emerald-400 tracking-wider uppercase font-semibold">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-white/50 hover:text-coral-300 hover:bg-white/5 transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
