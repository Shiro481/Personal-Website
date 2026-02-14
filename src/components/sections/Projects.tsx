
import React from 'react';
import { ExternalLink, Briefcase } from 'lucide-react';

const Projects: React.FC = () => {
    return (
        <section id="projects" className="bg-bg-secondary text-text-primary py-16 lg:py-24 relative overflow-hidden">
            <div className="absolute top-[194px] right-[-100px] w-[384px] h-[384px] bg-primary/5 rounded-full blur-[100px]" />

            <div className="container mx-auto max-w-7xl px-6 lg:px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 lg:mb-16">
                     <div className="flex items-end gap-4 mb-6 md:mb-0">
                         <span className="text-primary text-3xl lg:text-4xl font-bold font-poppins leading-none">03.</span>
                         <h2 className="text-3xl lg:text-4xl font-bold font-poppins leading-none">Featured Work</h2>
                    </div>
                     <div className="mt-4 md:mt-0">
                         <p className="text-text-secondary max-w-lg mb-4">
                             I'm currently building my portfolio of projects. Check back soon to see what I've been working on!
                         </p>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-2 hover:underline">
                            View Github <ExternalLink size={16} />
                        </a>
                     </div>
                </div>

                {/* Placeholder Project Card (Projects in Progress) */}
                <div className="w-full bg-bg-card border border-border rounded-2xl h-[400px] flex flex-col items-center justify-center text-center p-8 relative overflow-hidden group">
                     
                     <div className="w-20 h-20 rounded-full bg-bg border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                         <Briefcase size={40} className="text-text-primary" />
                     </div>
                     
                     <h3 className="text-2xl font-bold font-poppins mb-4">Projects in Progress</h3>
                     <p className="text-text-secondary max-w-md mb-8">
                        I am currently applying my learning to build personal projects that demonstrate my skills in React, TypeScript, and AI integration.
                     </p>

                     <div className="flex flex-wrap justify-center gap-3">
                        {['React', 'TypeScript', 'AI Integration', 'Tailwind CSS'].map((tech) => (
                             <span key={tech} className="px-3 py-1 bg-bg border border-border rounded-full text-xs text-text-secondary">
                                {tech}
                            </span>
                        ))}
                     </div>
                     
                     {/* Hover effect gradient */}
                     <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
                </div>
            </div>
        </section>
    );
};

export default Projects;
