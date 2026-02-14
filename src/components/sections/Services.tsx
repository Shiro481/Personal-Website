
import React from 'react';
import { Layout, Smartphone, Layers, Server, Code, Cloud, ArrowRight } from 'lucide-react';

const Services: React.FC = () => {
    const services = [
        { icon: Layout, title: 'Web Design', desc: 'Crafting beautiful, intuitive interfaces that engage users.' },
        { icon: Smartphone, title: 'Mobile Apps', desc: 'Building responsive cross-platform applications.' },
        { icon: Layers, title: 'UI/UX Design', desc: 'Designing user-centric workflows and prototypes.' },
        { icon: Server, title: 'Backend Systems', desc: 'Robust server-side logic and database management.' },
        { icon: Code, title: 'Scripting', desc: 'Automating tasks and optimizing workflows.' },
        { icon: Cloud, title: 'Cloud Solutions', desc: 'Deploying scalable applications to the cloud.' }
    ];

    return (
        <section id="services" className="bg-bg text-text-primary py-16 lg:py-24 relative overflow-hidden">
             {/* bg blur */}
             <div className="absolute top-[172px] right-0 translate-x-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />

            <div className="container mx-auto max-w-7xl px-6 lg:px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 lg:mb-16 gap-8">
                    <div className="max-w-xl">
                        <h2 className="text-3xl lg:text-5xl font-bold font-poppins mb-4">What I Do</h2>
                        <p className="text-text-secondary text-base lg:text-lg">
                            I combine technical expertise with creative problem-solving to deliver high-quality digital solutions.
                        </p>
                    </div>
                    <a href="#projects" className="text-primary flex items-center gap-2 hover:underline text-sm lg:text-base">
                        View All Projects <ArrowRight size={20}/>
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, idx) => (
                        <div key={idx} className="group p-[1px] rounded-2xl bg-gradient-to-b from-border to-transparent hover:from-primary hover:to-primary hover:bg-opacity-100 transition-all duration-300">
                             <div className="bg-bg-card rounded-2xl p-8 h-full relative overflow-hidden">
                                 {/* Icon */}
                                 <div className="w-14 h-14 bg-bg border border-border rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:bg-opacity-10 transition-colors">
                                     <service.icon className="text-text-primary group-hover:text-primary transition-colors" size={28} />
                                 </div>
                                 <h3 className="text-xl font-bold font-poppins mb-4">{service.title}</h3>
                                 <p className="text-text-secondary text-sm">{service.desc}</p>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
