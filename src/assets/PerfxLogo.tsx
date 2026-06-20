'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';

interface PerfxLogoProps {
    variant?: 'intro' | 'static' | 'icon';
    className?: string;
    fullLogoSrc?: string;
    iconLogoSrc?: string;
}

export const PerfxLogo: React.FC<PerfxLogoProps> = ({
    variant = 'static',
    className = '',
    fullLogoSrc = '/logo-perfx-full.png',
    iconLogoSrc = '/logo-perfx-icon.png',
}) => {
    const introContainerVariants: Variants = {
        hidden: { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
        visible: {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
                duration: 1.2,
                ease: [0.25, 1, 0.5, 1],
                staggerChildren: 0.3,
            },
        },
    };

    const subtleFloatVariants: Variants = {
        hidden: { y: 10, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100, damping: 20 },
        },
    };

    if (variant === 'icon') {
        return (
            <motion.div
                className={`relative overflow-hidden rounded-2xl shadow-md ${className}`}
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <img
                    src={iconLogoSrc}
                    alt="PERFX Icon"
                    width={150}
                    height={150}
                    className="object-contain"
                />
            </motion.div>
        );
    }

    if (variant === 'intro') {
        return (
            <motion.div
                className={`flex flex-col items-center justify-center ${className}`}
                variants={introContainerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={subtleFloatVariants} className="relative group">
                    <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <img
                        src={fullLogoSrc}
                        alt="PERFX Prevención de Fraude"
                        width={400}
                        height={200}
                        className="object-contain drop-shadow-xl"
                    />
                </motion.div>

                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '60%', opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1.5, ease: 'easeInOut' }}
                    className="h-1 bg-gradient-to-r from-transparent via-[#f97e00] to-transparent mt-8 rounded-full"
                />
            </motion.div>
        );
    }

    return (
        <div className={`flex items-center justify-center w-full ${className}`}>
            <img
                src={fullLogoSrc}
                alt="PERFX Logo"
                width={125}
                height={42}
                className="object-contain"
            />
        </div>
    );
};