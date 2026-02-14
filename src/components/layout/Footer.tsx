
import React from 'react';
import { ArrowUp } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-bg-card border-t border-border py-12 text-sm text-text-secondary">
            <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                
                <p>&copy; {new Date().getFullYear()} Shaq Lee Ambagan. All rights reserved.</p>

                <div className="flex items-center gap-6">
                    <a href="#" className="hover:text-primary transition-colors">Github</a>
                    <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
                    <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                </div>

                <a href="#" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 hover:text-primary transition-colors">
                    Back to Top <ArrowUp size={16} />
                </a>

            </div>
        </footer>
    );
};

export default Footer;
