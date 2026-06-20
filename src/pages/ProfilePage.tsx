import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Camera, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.email?.split('@')[0] || '');

    const formatName = (email: string | undefined) => {
        if (!email) return 'Usuario';
        const namePart = email.split('@')[0];
        return namePart.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-navy-900 dark:text-white mb-2">Mi Perfil</h1>
                <p className="text-slate-500 font-medium">Gestiona tu información personal y credenciales de acceso.</p>
            </header>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="h-32 bg-[#0B104A] relative">
                    {/* Botón de editar avatar simulado */}
                    <button className="absolute -bottom-10 left-8 w-24 h-24 bg-white rounded-full p-1 shadow-lg group">
                        <div className="w-full h-full rounded-full bg-slate-100 overflow-hidden relative flex items-center justify-center">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-slate-400" />
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </button>
                </div>

                <div className="pt-16 px-8 pb-8">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-navy-900 dark:text-white">{formatName(user?.email)}</h2>
                            <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest mt-1">{user?.role}</p>
                        </div>
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                        >
                            {isEditing ? 'Cancelar' : 'Editar Perfil'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input 
                                    type="text" 
                                    disabled={!isEditing}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-medium focus:border-[#0B104A] focus:bg-white focus:ring-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input 
                                    type="email" 
                                    disabled
                                    value={user?.email || ''}
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-medium opacity-70 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rol de Sistema</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Shield className="h-5 w-5 text-slate-400" />
                                </div>
                                <input 
                                    type="text" 
                                    disabled
                                    value={user?.role || ''}
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-medium uppercase opacity-70 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 pt-6 border-t border-slate-100 flex justify-end"
                        >
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-2 bg-[#F97E00] hover:bg-[#e07100] text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-orange-500/20"
                            >
                                <Save className="w-4 h-4" /> Guardar Cambios
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
