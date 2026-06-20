
import { NavLink, useLocation } from 'react-router-dom';
import { Shield, Search, Settings, Users, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav = () => {
    const location = useLocation();
    const { user } = useAuth();

    // Definimos los items laterales (ocultos si el rol es guest)
    const leftItems = user?.role === 'guest' ? [] : [
        { to: '/mcc', icon: Search, label: 'MCC' },
        { to: '/rules', icon: Settings, label: 'Reglas' },
    ];

    const rightItems = [
        ...(user?.role === 'admin' ? [{ to: '/users', icon: Users, label: 'Equipo' }] : []),
        ...(user?.role !== 'guest' ? [{ to: '/audit', icon: FileText, label: 'Auditoría' }] : []),
    ];

    return (
        // Se oculta en pantallas grandes (lg:hidden) y se fija al fondo
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">

            {/* Contenedor principal de la barra */}
            <div className="relative bg-white shadow-[0_-10px_40px_rgba(11,16,74,0.08)] rounded-t-[2.5rem] px-6 h-20 flex justify-between items-center pb-safe">

                {/* Grupo Izquierdo */}
                <div className="flex space-x-6">
                    {leftItems.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <NavLink key={item.to} to={item.to} className="relative flex flex-col items-center justify-center w-12 group">
                                <item.icon
                                    className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-navy-900' : 'text-slate-400 group-hover:text-slate-600'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className={`text-[9px] font-bold mt-1 tracking-wider transition-colors duration-300 ${isActive ? 'text-navy-900' : 'text-slate-400'}`}>
                                    {item.label}
                                </span>
                                {/* Puntito indicador de activo */}
                                {isActive && (
                                    <motion.div layoutId="nav-indicator" className="absolute -bottom-2 w-1 h-1 bg-[#F97E00] rounded-full" />
                                )}
                            </NavLink>
                        );
                    })}
                </div>

                {/* BOTÓN CENTRAL FLOTANTE (El Evaluador) */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -top-8">
                    {/* El 'bg-slate-50' crea la ilusión del recorte curvo asumiendo que tu app tiene fondo slate-50 */}
                    <div className="bg-slate-50 p-2 rounded-full">
                        <NavLink to="/evaluate">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(249,126,0,0.35)] transition-all duration-300 ${location.pathname === '/evaluate'
                                        ? 'bg-[#0B104A] shadow-[0_8px_25px_rgba(11,16,74,0.35)]'
                                        : 'bg-[#F97E00]'
                                    }`}
                            >
                                <Shield className="w-8 h-8 text-white" strokeWidth={2} />
                            </motion.button>
                        </NavLink>
                    </div>
                </div>

                {/* Grupo Derecho */}
                <div className="flex space-x-6">
                    {rightItems.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <NavLink key={item.to} to={item.to} className="relative flex flex-col items-center justify-center w-12 group">
                                <item.icon
                                    className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-navy-900' : 'text-slate-400 group-hover:text-slate-600'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className={`text-[9px] font-bold mt-1 tracking-wider transition-colors duration-300 ${isActive ? 'text-navy-900' : 'text-slate-400'}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div layoutId="nav-indicator" className="absolute -bottom-2 w-1 h-1 bg-[#F97E00] rounded-full" />
                                )}
                            </NavLink>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};