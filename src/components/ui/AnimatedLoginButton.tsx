import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface AnimatedLoginButtonProps {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
}

export const AnimatedLoginButton: React.FC<AnimatedLoginButtonProps> = ({ onClick }) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (status === 'loading' || status === 'success') return;

        setStatus('loading');

        try {
            await onClick(e);
            setStatus('success');
            // El estado de éxito se mantiene mientras el router hace la redirección
        } catch (error) {
            setStatus('error');
            // Si falla, tiembla en rojo y a los 2 segundos vuelve a la normalidad
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const bgColors = {
        idle: 'bg-[#0B104A] hover:bg-[#141A68]', // Azul PERFX
        loading: 'bg-[#0B104A]/90 cursor-not-allowed',
        success: 'bg-emerald-500',
        error: 'bg-coral-500',
    };

    const buttonVariants = {
        idle: { scale: 1, x: 0 },
        loading: { scale: 0.98, x: 0 },
        success: { scale: 1.02, x: 0 },
        error: {
            scale: 1,
            x: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.4 }
        },
    };

    return (
        <motion.button
            onClick={handleClick}
            variants={buttonVariants}
            animate={status}
            whileHover={status === 'idle' ? { scale: 1.01 } : {}}
            whileTap={status === 'idle' ? { scale: 0.98 } : {}}
            className={`relative w-full h-14 flex items-center justify-center rounded-2xl text-white font-bold text-xs uppercase tracking-wider transition-colors duration-300 overflow-hidden shadow-lg shadow-[#0B104A]/20 mt-2 ${bgColors[status]}`}
        >
            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="flex items-center gap-2"
                    >
                        Acceder al sistema <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                    </motion.div>
                )}

                {status === 'loading' && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center gap-2"
                    >
                        <Loader2 className="w-5 h-5 animate-spin" /> VALIDANDO...
                    </motion.div>
                )}

                {status === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-5 h-5" /> ACCESO APROBADO
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="flex items-center gap-2"
                    >
                        <XCircle className="w-5 h-5" /> DENEGADO
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
};