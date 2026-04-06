import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';

interface PreloaderProps {
    onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const timer = setTimeout(() => {
            onComplete();
        }, 2200);
        
        return () => {
            document.body.style.overflow = 'unset';
            clearTimeout(timer);
        };
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ 
                y: "-100%", 
                transition: { 
                    duration: 0.8, 
                    ease: [0.76, 0, 0.24, 1] // Custom cubic-bezier for smooth "curtain" effect
                } 
            }}
        >
            <div className="relative flex flex-col items-center">
                {/* Clean, premium Logo Animation */}
                <motion.div
                    initial={{ scale: 0, rotate: -45, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ 
                        duration: 0.8, 
                        type: "spring", 
                        bounce: 0.5 
                    }}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_50px_rgba(56,189,248,0.3)] mb-8 glass-effect"
                >
                    <Code2 size={48} strokeWidth={2.5} />
                </motion.div>
                
                {/* Text Reveal Animation */}
                <div className="overflow-hidden mb-2">
                    <motion.h1
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                        className="text-4xl md:text-5xl font-bold text-white font-[Poppins] tracking-tight"
                    >
                        Shaq Lee
                    </motion.h1>
                </div>
                
                <motion.p
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.6, duration: 0.5 }}
                     className="text-gray-400 font-medium tracking-widest uppercase text-sm"
                >
                    Portfolio
                </motion.p>

                {/* Loading Line */}
                <motion.div
                    className="absolute -bottom-12 left-0 right-0 h-1 bg-gray-800 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <motion.div 
                        className="h-full bg-gradient-to-r from-sky-400 to-blue-600"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.8, duration: 1.2, ease: "easeInOut" }}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Preloader;
