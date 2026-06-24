import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { LogOut, UserCircle, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PerfxLogo } from '../../assets/PerfxLogo';
import { Link } from 'react-router-dom';

export const TopNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const dropdownVariants: Variants = {
        hidden: { opacity: 0, y: -10, scale: 0.95, filter: 'blur(5px)' },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: { type: 'spring', stiffness: 300, damping: 25 }
        },
        exit: { opacity: 0, y: -10, scale: 0.95, filter: 'blur(5px)', transition: { duration: 0.2 } }
    };

    const formatName = (email: string | undefined) => {
        if (!email) return 'Usuario';
        const namePart = email.split('@')[0];
        return namePart.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    };

    return (
        <header className="lg:hidden fixed top-4 inset-x-4 z-50">
            <nav className="relative flex items-center justify-between px-5 py-2.5 bg-[#0B104A]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl">
                
                {/* LOGO PERFX */}
                <div className="flex items-center gap-3">
                    <PerfxLogo variant="static" className="w-24" />
                </div>

                {/* PERFIL */}
                <div className="relative" ref={menuRef}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center justify-center w-11 h-11 rounded-full border-2 border-white/10 overflow-hidden hover:border-white/30 transition-colors bg-[#1f2856] focus:outline-none"
                    >
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Perfil" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white text-xs font-bold">{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                variants={dropdownVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="absolute right-0 mt-3 w-56 bg-[#0B104A] border border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col z-50"
                            >
                                <div className="px-4 py-3 border-b border-white/5 bg-white dark:bg-navy-800/5">
                                    <p className="text-sm font-semibold text-white truncate">{formatName(user?.email)}</p>
                                    <p className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase mt-0.5">{user?.role}</p>
                                </div>

                                <div className="p-2 flex flex-col gap-1">
                                    <Link 
                                        to="/profile" 
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white dark:hover:bg-navy-700 dark:bg-navy-800/5 transition-colors"
                                    >
                                        <UserCircle className="w-4 h-4 text-slate-400" />
                                        Mi Perfil
                                    </Link>
                                    <Link 
                                        to="/settings"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white dark:hover:bg-navy-700 dark:bg-navy-800/5 transition-colors"
                                    >
                                        <Settings className="w-4 h-4 text-slate-400" />
                                        Configuración
                                    </Link>

                                    <div className="h-[1px] bg-white dark:bg-navy-800/5 my-1" />

                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-coral-400 hover:text-coral-300 hover:bg-coral-500/10 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </nav>
        </header>
    );
};