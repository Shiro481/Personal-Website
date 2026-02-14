
import React from 'react';
import { Sparkles, BookOpen, GraduationCap, Terminal, Download, Github, Linkedin } from 'lucide-react';

const About: React.FC = () => {
    return (
        <section id="about" className="bg-bg-secondary text-text-primary py-24 relative overflow-hidden">
             {/* Background Blob */}
            <div className="absolute top-[200px] left-0 w-[256px] h-[256px] bg-primary/5 rounded-full blur-[80px]" />

            <div className="container mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-12 gap-16">
                 {/* Left Column: Image/Profile */}
                <div className="lg:col-span-5 relative order-2 lg:order-1">
                    <div className="relative rounded-2xl overflow-hidden border border-border bg-bg-card p-2">
                        <div className="aspect-[4/5] rounded-xl overflow-hidden relative">
                             <img 
                                src="/Images/About.JPG" 
                                alt="Shaq Lee" 
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay content on image */}
                             <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                                <h3 className="text-2xl font-bold font-poppins text-white">Shaq Lee Ambagan</h3>
                                <p className="text-primary">Aspiring Developer</p>
                             </div>
                        </div>
                    </div>
                    
                    {/* CV Download & Socials */}
                    <div className="mt-6 flex gap-4">
                        <button className="flex-1 bg-primary hover:bg-primary/80 text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
                            <Download size={20} />
                            Download CV
                        </button>
                        <div className="flex gap-2">
                            <a href="#" className="w-12 h-12 bg-bg-card border border-border rounded-xl flex items-center justify-center hover:border-primary transition-colors">
                                <Github className="text-text-primary" size={20} />
                            </a>
                            <a href="#" className="w-12 h-12 bg-bg-card border border-border rounded-xl flex items-center justify-center hover:border-primary transition-colors">
                                <Linkedin className="text-text-primary" size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                 {/* Right Column: Content */}
                <div className="lg:col-span-7 space-y-12 order-1 lg:order-2">
                    {/* Section Header */}
                    <div className="flex items-end gap-4">
                         <span className="text-primary text-4xl font-bold font-poppins leading-none">01.</span>
                         <h2 className="text-4xl font-bold font-poppins leading-none text-text-primary">About Me</h2>
                    </div>

                    {/* Bio Text */}
                    <div className="space-y-6 text-lg text-text-secondary font-sans leading-relaxed">
                        <p>
                            Hello! I'm a <span className="text-text-primary font-bold">Computer Engineering student</span> with a strong ambition to break into the tech industry. I am currently in the learning phase, absorbing everything I can about software development to turn my passion into a career.
                        </p>
                        <p>
                            My learning process is supercharged by <span className="inline-flex items-center gap-2 text-primary mx-1"><Sparkles size={18}/> Large Language Models (AI)</span>. I leverage AI to accelerate my understanding of complex concepts, debug code, and explore best practices in web architecture.
                        </p>
                        <p>
                             I haven't worked on professional projects yet, but I am eagerly building personal projects and experimenting with new technologies. My goal is to join a team where I can contribute, learn, and grow as a developer.
                        </p>
                    </div>

                    {/* Tech Stack */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold font-poppins">Technologies I'm Learning</h3>
                        <div className="flex flex-wrap gap-3">
                            {['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Figma', 'Node.js', 'Python'].map((tech) => (
                                <span key={tech} className="px-4 py-2 bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-full text-sm text-[#d1d5dc]">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* My Journey / Timeline */}
                    <div className="space-y-8">
                        <h3 className="text-xl font-bold font-poppins">My Journey</h3>
                        <div className="border-l border-[rgba(255,255,255,0.1)] pl-8 ml-3 space-y-12 relative">
                             {/* Item 1 */}
                            <div className="relative">
                                <div className="absolute -left-[37px] top-1 w-[10px] h-[10px] bg-primary rounded-full shadow-[0_0_10px_0_#3dbcff]" />
                                <div className="flex justify-between items-center mb-2">
                                     <h4 className="font-bold text-lg">Computer Engineering Student</h4>
                                     <span className="text-sm font-mono text-[#6a7282]">2026 - Present</span>
                                </div>
                                <div className="flex items-center gap-2 text-primary text-sm mb-2">
                                    <GraduationCap size={16} /> University Name
                                </div>
                                <p className="text-text-gray text-sm">Currently pursuing my degree. Focused on building a strong foundation in software and hardware principles.</p>
                            </div>

                             {/* Item 2 */}
                             <div className="relative">
                                <div className="absolute -left-[37px] top-1 w-[10px] h-[10px] bg-primary rounded-full shadow-[0_0_10px_0_#3dbcff]" />
                                <div className="flex justify-between items-center mb-2">
                                     <h4 className="font-bold text-lg">Self-Directed Learning</h4>
                                     <span className="text-sm font-mono text-[#6a7282]">2024</span>
                                </div>
                                <div className="flex items-center gap-2 text-primary text-sm mb-2">
                                    <BookOpen size={16} /> Online Resources & Docs
                                </div>
                                <p className="text-text-gray text-sm">Diving deep into modern web technologies. Building personal projects to bridge the gap between theory and practice.</p>
                            </div>

                             {/* Item 3 */}
                             <div className="relative">
                                <div className="absolute -left-[37px] top-1 w-[10px] h-[10px] bg-primary rounded-full shadow-[0_0_10px_0_#3dbcff]" />
                                <div className="flex justify-between items-center mb-2">
                                     <h4 className="font-bold text-lg">Started Coding Journey</h4>
                                     <span className="text-sm font-mono text-[#6a7282]">2021</span>
                                </div>
                                <div className="flex items-center gap-2 text-primary text-sm mb-2">
                                    <Terminal size={16} /> Self-Taught
                                </div>
                                <p className="text-text-gray text-sm">Wrote my first lines of code. Explored HTML, CSS, and the basics of programming logic.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
