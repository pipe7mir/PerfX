import { Bell, ShieldAlert, Moon, Globe } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        notifications: true,
        darkMode: false,
        twoFactorAuth: false,
        locationTracking: true,
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-[#0B104A] mb-2">Configuración</h1>
                <p className="text-slate-500 font-medium">Personaliza las preferencias operativas y de seguridad de la plataforma.</p>
            </header>

            <div className="grid gap-6">
                {/* Panel de Preferencias */}
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[#0B104A]">Preferencias de Usuario</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#0B104A]">Notificaciones Push</p>
                                    <p className="text-xs font-medium text-slate-400">Recibe alertas sobre transacciones sospechosas</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => toggleSetting('notifications')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.notifications ? 'bg-[#0B104A]' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.notifications ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                                    <Moon className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#0B104A]">Modo Oscuro</p>
                                    <p className="text-xs font-medium text-slate-400">Cambia la interfaz a colores oscuros</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => toggleSetting('darkMode')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-[#0B104A]' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.darkMode ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Panel de Seguridad */}
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[#0B104A]">Seguridad y Privacidad</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                                    <ShieldAlert className="w-5 h-5 text-[#F97E00]" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#0B104A]">Autenticación de 2 Factores</p>
                                    <p className="text-xs font-medium text-slate-400">Añade una capa extra de seguridad al login</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => toggleSetting('twoFactorAuth')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.twoFactorAuth ? 'bg-[#0B104A]' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.twoFactorAuth ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#0B104A]">Telemetría y Ubicación</p>
                                    <p className="text-xs font-medium text-slate-400">Permitir enviar datos de sesión para auditoría</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => toggleSetting('locationTracking')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.locationTracking ? 'bg-[#0B104A]' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.locationTracking ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
