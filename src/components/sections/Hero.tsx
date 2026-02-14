
import React from 'react';

const Hero: React.FC = () => {
    return (
        <section className="bg-bg relative overflow-hidden text-text-primary min-h-screen flex items-center justify-center px-6 py-24 lg:p-16">
            <div className="absolute inset-0 bg-transparent"
                style={{
                    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.03) 0.10593%, rgba(0, 0, 0, 0) 0.10593%), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0) 0%)"
                }}
            />

            {/* Gradient Orbs - keep same or adjust opacity for light mode via CSS var but hardcoded is ok for effect */}
            <div className="absolute top-[-188px] left-[-166px] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-68" />
            <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]" />

            <div className="container mx-auto max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 items-center">
                <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
                    {/* Status Badge */}
                    <div className="inline-flex items-center px-4 py-2 rounded-full border border-primary/30 bg-primary/10">
                        <span className="text-primary text-xs lg:text-sm font-sans uppercase tracking-wider">Available as an intern</span>
                    </div>

                    {/* Heading */}
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold font-poppins leading-tight text-text-primary">
                            Creative <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#ad46ff]">
                                Developer.
                            </span>
                        </h1>
                    </div>

                    {/* Subtext */}
                    <p className="text-text-secondary text-base md:text-lg lg:text-xl font-sans max-w-lg leading-relaxed mx-auto lg:mx-0">
                        I'm <span className="font-bold text-text-primary">Shaq Lee Ambagan</span>, a CpE Student and Web Enthusiast building digital experiences that merge art with engineering.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        <a href="#projects" className="bg-primary hover:bg-primary/90 text-black font-bold py-3 px-6 lg:py-4 lg:px-8 rounded-xl shadow-[0_0_20px_0_rgba(61,188,255,0.4)] transition-all text-sm lg:text-base">
                            View My Work
                        </a>
                        <a href="#contact" className="bg-bg-card border border-border hover:bg-border text-text-primary font-sans py-3 px-6 lg:py-4 lg:px-8 rounded-xl transition-all text-sm lg:text-base">
                            Contact Me
                        </a>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="relative flex justify-center lg:justify-end">
                    <div className="relative w-full max-w-[450px] aspect-[450/550]">
                        {/* Frames/Borders */}
                        <div className="absolute inset-0 translate-x-5 translate-y-10 border-2 border-primary/30 rounded-[32px]" />
                        <div className="absolute inset-0 -translate-x-5 -translate-y-10 bg-bg-card opacity-50 rounded-[32px]" />
                        
                        {/* Main Image Container */}
                        <div className="absolute inset-0 bg-bg-secondary rounded-[32px] overflow-hidden border border-border shadow-2xl">
                            <img 
                                src="/images/Hero.JPG" 
                                alt="Shaq Lee" 
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay Gradient - dramatically reduced opacity */}
                             <div className="absolute inset-0 bg-gradient-to-b from-bg via-transparent to-transparent opacity-10" />
                        </div>

                         {/* Floating Badge */}
                        <div className="absolute bottom-8 right-[-20px] lg:right-[-40px] bg-bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-xl backdrop-blur-sm">
                            <div className="w-3 h-3 bg-[#00c950] rounded-full animate-pulse" />
                            <span className="text-text-primary text-sm font-sans">Online & Coding</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
