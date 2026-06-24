import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Camera, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [name, setName] = useState(user?.email?.split('@')[0] || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatName = (email: string | undefined) => {
        if (!email) return 'Usuario';
        const namePart = email.split('@')[0];
        return namePart.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;
        
        setIsUploading(true);
        try {
            const url = await api.storage.uploadAvatar(file);
            await api.users.update(user.id, { avatar_url: url });
            updateUser({ ...user, avatar_url: url });
            toast.success('Foto de perfil actualizada');
        } catch (err: any) {
            toast.error(err.message || 'Error al actualizar la foto');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-[#0B104A] dark:text-white mb-2">Mi Perfil</h1>
                <p className="text-slate-500 font-medium">Gestiona tu información personal y credenciales de acceso.</p>
            </header>

            <div className="bg-white dark:bg-navy-800 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-white/10 overflow-hidden">
                <div className="h-32 bg-[#0B104A] relative">
                    {/* Botón de editar avatar */}
                    <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleAvatarChange} />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute -bottom-10 left-8 w-24 h-24 bg-white dark:bg-navy-800 rounded-full p-1 shadow-lg group disabled:opacity-70"
                    >
                        <div className="w-full h-full rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden relative flex items-center justify-center">
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-[#0B104A] animate-spin" />
                            ) : user?.avatar_url ? (
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
                            <h2 className="text-2xl font-bold text-[#0B104A] dark:text-white">{formatName(user?.email)}</h2>
                            <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest mt-1">{user?.role}</p>
                        </div>
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-6 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 text-slate-700 dark:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
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
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-medium text-[#0B104A] dark:text-white dark:bg-[#11175c] focus:border-[#0B104A] focus:bg-white focus:ring-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-medium text-[#0B104A] dark:text-white dark:bg-[#11175c] opacity-70 cursor-not-allowed"
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
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-medium text-[#0B104A] dark:text-white dark:bg-[#11175c] uppercase opacity-70 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 flex justify-end"
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
