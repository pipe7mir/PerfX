import { Bell, ShieldAlert, Moon, Globe, Sun, X, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('perfx_settings');
        const parsed = saved ? JSON.parse(saved) : {};
        return {
            notifications: parsed.notifications ?? true,
            locationTracking: parsed.locationTracking ?? true,
        };
    });

    // Estado local para UI de 2FA (se basa en DB)
    const [is2faEnabled, setIs2faEnabled] = useState(user?.is_2fa_enabled || false);

    // Modal state para 2FA
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [totpSecret, setTotpSecret] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        localStorage.setItem('perfx_settings', JSON.stringify(settings));
    }, [settings]);

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleToggle2FA = async () => {
        if (is2faEnabled) {
            // Desactivar
            setIsProcessing(true);
            try {
                await api.auth.disable2FA();
                setIs2faEnabled(false);
                toast.success('Autenticación de 2 Factores desactivada');
                // Aquí idealmente deberíamos actualizar el user de AuthContext
            } catch (err: any) {
                toast.error(err.message || 'Error desactivando 2FA');
            } finally {
                setIsProcessing(false);
            }
        } else {
            // Activar -> Abrir modal y generar QR
            setIsProcessing(true);
            try {
                const res = await api.auth.generate2FA();
                setQrCodeUrl(res.qrCode);
                setTotpSecret(res.secret);
                setTotpCode('');
                setShow2FAModal(true);
            } catch (err: any) {
                toast.error(err.message || 'Error generando 2FA');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleConfirm2FA = async () => {
        if (totpCode.length !== 6) {
            toast.error('El código debe tener 6 dígitos');
            return;
        }
        setIsProcessing(true);
        try {
            await api.auth.enable2FA(totpCode, totpSecret);
            setIs2faEnabled(true);
            setShow2FAModal(false);
            toast.success('¡2FA activado correctamente!');
        } catch (err: any) {
            toast.error(err.message || 'Código incorrecto');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-[#0B104A] dark:text-white mb-2">Configuración</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Personaliza las preferencias operativas y de seguridad de la plataforma.</p>
            </header>

            <div className="grid gap-6">
                {/* Panel de Preferencias */}
                <div className="bg-white dark:bg-abyssal-light rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[#0B104A] dark:text-white/80">Preferencias de Usuario</h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#0B104A] dark:text-white">Notificaciones Push</p>
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
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                                    {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-indigo-500" />}
                                </div>
                                <div>
                                    <p className="font-bold text-[#0B104A] dark:text-white">Modo Oscuro</p>
                                    <p className="text-xs font-medium text-slate-400">Cambia la interfaz a colores oscuros</p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleTheme}
                                className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-[#0B104A]' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Panel de Seguridad */}
                <div className="bg-white dark:bg-abyssal-light rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[#0B104A] dark:text-white/80">Seguridad y Privacidad</h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                                    <ShieldAlert className="w-5 h-5 text-[#F97E00]" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#0B104A] dark:text-white">Autenticación de 2 Factores</p>
                                    <p className="text-xs font-medium text-slate-400">Añade una capa extra de seguridad al login</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleToggle2FA}
                                disabled={isProcessing}
                                className={`w-12 h-6 rounded-full transition-colors relative disabled:opacity-50 ${is2faEnabled ? 'bg-[#0B104A]' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${is2faEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#0B104A] dark:text-white">Telemetría y Ubicación</p>
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

            {/* Modal de Configuración 2FA */}
            {show2FAModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setShow2FAModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-2 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        
                        <div className="text-center mb-6 mt-2">
                            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldAlert className="w-6 h-6 text-[#F97E00]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#0B104A]">Activar 2FA</h2>
                            <p className="text-sm text-slate-500 mt-2">
                                Escanea este código QR con tu aplicación de autenticación (Google Authenticator, Authy, etc).
                            </p>
                        </div>

                        {qrCodeUrl ? (
                            <div className="flex justify-center mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40" />
                            </div>
                        ) : (
                            <div className="flex justify-center mb-6 p-4">
                                <div className="w-40 h-40 animate-pulse bg-slate-200 rounded-xl"></div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative flex items-center">
                                <div className="absolute left-4 text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Código de 6 dígitos"
                                    value={totpCode}
                                    onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full bg-slate-50 text-center tracking-[0.5em] text-lg font-mono font-bold text-slate-800 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0B104A]/20 transition-all border border-slate-100"
                                />
                            </div>
                            <button
                                onClick={handleConfirm2FA}
                                disabled={totpCode.length !== 6 || isProcessing}
                                className="w-full bg-[#0B104A] hover:bg-[#151c6b] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                            >
                                {isProcessing ? 'Verificando...' : 'Confirmar Activación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
