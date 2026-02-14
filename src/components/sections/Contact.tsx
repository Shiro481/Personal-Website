
import React from 'react';
import emailjs from '@emailjs/browser';
import { Mail, Phone, MapPin, Send, Check, X } from 'lucide-react';

const Contact: React.FC = () => {
    const form = React.useRef<HTMLFormElement>(null);
    const [isSending, setIsSending] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        // TODO: To use Gmail, create a "Gmail" Service in EmailJS:
        // 1. Go to https://dashboard.emailjs.com/admin/services
        // 2. Click "Add New Service" -> Select "Gmail"
        // 3. Connect your account and copy the Service ID (e.g., service_gmail)
        const SERVICE_ID = 'service_4y2ltcw';
        const TEMPLATE_ID = 'template_6i7yxvi';
        const PUBLIC_KEY = 'goEmZYuj_vX91g0DO';



        try {
                if (form.current) {
                    await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY);
                    setShowModal(true);
                    form.current.reset();
                }
        } catch (error) {
            console.error('Failed to send message:', error);
            alert("Failed to send message. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <section id="contact" className="bg-bg text-text-primary py-16 lg:py-24 relative overflow-hidden">
             {/* Background Blob */}
            <div className="absolute bottom-0 left-[-100px] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />

            <div className="container mx-auto max-w-7xl px-6 lg:px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 relative z-10">
                {/* Left Column: Info */}
                <div>
                     <div className="flex items-end gap-4 mb-8">
                         <span className="text-primary text-3xl lg:text-4xl font-bold font-poppins leading-none">04.</span>
                         <h2 className="text-3xl lg:text-4xl font-bold font-poppins leading-none">Get in Touch</h2>
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
                <form 
                    ref={form}
                    onSubmit={handleSubmit}
                    className="bg-bg-card border border-border p-8 rounded-3xl shadow-lg"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <label htmlFor="user_name" className="text-sm font-bold ml-1">Name</label>
                            <input 
                                type="text" 
                                name="user_name"
                                id="user_name" 
                                placeholder="Your Name" 
                                required
                                className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-secondary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="user_email" className="text-sm font-bold ml-1">Email</label>
                            <input 
                                type="email" 
                                name="user_email"
                                id="user_email" 
                                placeholder="your@email.com" 
                                required
                                className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-secondary/50"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                         <label htmlFor="subject" className="text-sm font-bold ml-1">Subject</label>
                         <input 
                            type="text" 
                            name="subject"
                            id="subject" 
                            placeholder="Project Inquiry" 
                            required
                            className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-secondary/50"
                        />
                    </div>

                    <div className="space-y-2 mb-8">
                         <label htmlFor="message" className="text-sm font-bold ml-1">Message</label>
                         <textarea 
                            name="message"
                            id="message" 
                            rows={4} 
                            placeholder="Tell me about your project..." 
                            required
                            className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none placeholder:text-text-secondary/50"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSending}
                        className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded-xl shadow-[0_0_20px_0_rgba(61,188,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSending ? 'Sending...' : 'Send Message'} <Send size={18} className={isSending ? 'animate-pulse' : ''} />
                    </button>
                </form>
            </div>

            {/* Success Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-bg-card border border-border p-8 rounded-3xl shadow-[0_0_50px_0_rgba(61,188,255,0.2)] max-w-sm w-full relative animate-in fade-in zoom-in duration-300">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                                <Check size={32} strokeWidth={3} />
                            </div>
                            
                            <h3 className="text-2xl font-bold font-poppins text-white mb-2">Message Sent!</h3>
                            <p className="text-text-secondary mb-8">
                                Thanks for reaching out. I'll get back to you as soon as possible!
                            </p>
                            
                            <button 
                                onClick={() => setShowModal(false)}
                                className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3 rounded-xl transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Contact;
