
import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact: React.FC = () => {
    return (
        <section id="contact" className="bg-bg text-text-primary py-24 relative overflow-hidden">
             {/* Background Blob */}
            <div className="absolute bottom-0 left-[-100px] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />

            <div className="container mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                {/* Left Column: Info */}
                <div>
                     <div className="flex items-end gap-4 mb-8">
                         <span className="text-primary text-4xl font-bold font-poppins leading-none">04.</span>
                         <h2 className="text-4xl font-bold font-poppins leading-none">Get in Touch</h2>
                    </div>
                    <p className="text-text-secondary text-lg mb-12 max-w-md">
                        I'm currently looking for internships and new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
                    </p>

                    <div className="space-y-8">
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-bg-card border border-border rounded-xl flex items-center justify-center text-primary">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold font-poppins">Email</h4>
                                <a href="mailto:shaqlee.ambagan@example.com" className="text-text-secondary hover:text-primary transition-colors">shaqlee.ambagan@example.com</a>
                            </div>
                         </div>

                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-bg-card border border-border rounded-xl flex items-center justify-center text-primary">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold font-poppins">Phone</h4>
                                <a href="tel:+1234567890" className="text-text-secondary hover:text-primary transition-colors">+123 456 7890</a>
                            </div>
                         </div>

                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-bg-card border border-border rounded-xl flex items-center justify-center text-primary">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold font-poppins">Location</h4>
                                <p className="text-text-secondary">City, Country</p>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Right Column: Form */}
                <form className="bg-bg-card border border-border p-8 rounded-3xl shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-bold ml-1">Name</label>
                            <input 
                                type="text" 
                                id="name" 
                                placeholder="Your Name" 
                                className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-secondary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-bold ml-1">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="your@email.com" 
                                className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-secondary/50"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                         <label htmlFor="subject" className="text-sm font-bold ml-1">Subject</label>
                         <input 
                            type="text" 
                            id="subject" 
                            placeholder="Project Inquiry" 
                            className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-secondary/50"
                        />
                    </div>

                    <div className="space-y-2 mb-8">
                         <label htmlFor="message" className="text-sm font-bold ml-1">Message</label>
                         <textarea 
                            id="message" 
                            rows={4} 
                            placeholder="Tell me about your project..." 
                            className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none placeholder:text-text-secondary/50"
                        />
                    </div>

                    <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded-xl shadow-[0_0_20px_0_rgba(61,188,255,0.4)] transition-all flex items-center justify-center gap-2">
                        Send Message <Send size={18} />
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Contact;
