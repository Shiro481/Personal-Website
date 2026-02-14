
import React, { useState, useEffect } from 'react';
import { Menu, X, Code2, Sun, Moon } from 'lucide-react';
import clsx from 'clsx';

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

    return (
        <nav
            className={clsx(
                'fixed top-0 w-full z-50 transition-all duration-300',
                scrolled
                    ? 'bg-bg/80 backdrop-blur-md border-b border-border py-4 shadowy-lg'
                    : 'bg-transparent py-6'
            )}
        >
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <a href="#" className="flex items-center gap-2 group">
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
                            className="bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 backdrop-blur-sm"
                        >
                            Let's Talk
                        </a>
                    </div>


                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden text-text-primary hover:text-primary transition-colors focus:outline-none"
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={clsx(
                    'fixed inset-0 bg-bg/95 backdrop-blur-xl z-40 md:hidden transition-all duration-300 flex flex-col items-center justify-center space-y-8',
                    isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                )}
            >
                {navLinks.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="text-2xl font-poppins font-bold text-text-primary hover:text-primary transition-colors"
                    >
                        {link.name}
                    </a>
                ))}
                
                <a
                    href="#contact"
                    onClick={() => setIsOpen(false)}
                    className="mt-8 px-8 py-3 bg-primary text-black font-bold rounded-full text-lg hover:shadow-[0_0_20px_rgba(61,188,255,0.4)] transition-all"
                >
                    Let's Talk
                </a>
            </div>
        </nav>
    );
};

export default Navbar;
