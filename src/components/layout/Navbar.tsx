
import React, { useState, useEffect } from 'react';
import { Menu, X, Code2, Sun, Moon } from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        
        // Initialize theme from local storage or system preference
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            setTheme('light');
            document.documentElement.setAttribute('data-theme', 'light');
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const navLinks = [
        { name: 'Home', href: '#' },
        { name: 'About', href: '#about' },
        { name: 'Services', href: '#services' },
        { name: 'Projects', href: '#projects' },
        { name: 'Contact', href: '#contact' },
    ];

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        setIsOpen(false);
        
        // Wait for mobile menu close animation to prevent layout conflicts
        setTimeout(() => {
            const targetId = href.replace('#', '');
            const element = document.getElementById(targetId);
            
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', href);
            } else if (href === '#') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.history.pushState(null, '', window.location.pathname);
            }
        }, 300);
    };

    return (
        <nav
            className={clsx(
                'fixed top-0 w-full z-50 transition-all duration-300',
                scrolled
                    ? 'bg-bg/80 backdrop-blur-md border-b border-border py-4 shadowy-lg'
                    : 'bg-transparent py-6'
            )}
        >
            <div className="container mx-auto px-4 max-w-7xl relative z-50">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <a href="#" onClick={(e) => handleNavClick(e, '#')} className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                           <Code2 size={24} />
                        </div>
                        <span className="text-text-primary font-poppins font-bold text-xl tracking-tight group-hover:text-primary transition-colors">
                            Shaq Lee
                        </span>
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className="text-text-secondary hover:text-primary font-medium text-sm transition-colors relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                            </a>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-bg-card text-text-primary transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* CTA Button (Desktop) */}
                        <a
                            href="#contact"
                            onClick={(e) => handleNavClick(e, '#contact')}
                            className="bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 backdrop-blur-sm"
                        >
                            Let's Talk
                        </a>
                    </div>


                    {/* Mobile Menu Button - Animated */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden text-text-primary hover:text-primary transition-colors focus:outline-none z-50 relative"
                    >
                         <AnimatePresence mode="wait">
                            <motion.div
                                key={isOpen ? 'close' : 'menu'}
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: 90 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isOpen ? <X size={28} /> : <Menu size={28} />}
                            </motion.div>
                         </AnimatePresence>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="absolute top-full left-0 w-full bg-bg/95 backdrop-blur-xl border-b border-border shadow-2xl md:hidden overflow-hidden origin-top"
                    >
                        <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
                            {navLinks.map((link, index) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 + 0.1 }}
                                >
                                    <a
                                        href={link.href}
                                        onClick={(e) => handleNavClick(e, link.href)}
                                        className="text-lg font-medium text-text-secondary hover:text-primary hover:pl-2 transition-all block"
                                    >
                                        {link.name}
                                    </a>
                                </motion.div>
                            ))}

                            <motion.div 
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                transition={{ delay: 0.3 }}
                                className="w-full h-px bg-border/50 my-2 origin-left" 
                            />
                            
                            {/* Mobile Theme Toggle */}
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                onClick={toggleTheme}
                                className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors group"
                            >
                                <div className="p-2 rounded-lg bg-bg-card group-hover:bg-primary/10 transition-colors">
                                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                </div>
                                <span className="font-medium">
                                    {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                </span>
                            </motion.button>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <a
                                    href="#contact"
                                    onClick={(e) => handleNavClick(e, '#contact')}
                                    className="w-full bg-primary text-black font-bold rounded-xl py-3 text-center shadow-[0_0_20px_0_rgba(61,188,255,0.3)] hover:shadow-[0_0_25px_0_rgba(61,188,255,0.5)] transition-all mt-2 block"
                                >
                                    Let's Talk
                                </a>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
