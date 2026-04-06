import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon, Clock, User, Briefcase, Phone, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';

// Service to Event Type ID Mapping from cal_events.json
// Service to Event Type ID Mapping using the new 1-hour "consultation" event
const SERVICE_TYPE_MAP: Record<string, number> = {
    "General Consultation": 5265005, 
    "Web Development": 5265005,      
    "UI/UX Design": 5265005,         
    "Mentorship": 5265005,           
    "Other": 5265005                 
};

const BookingPage: React.FC = () => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({});
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        service: '',
        date: '', // Format: YYYY-MM-DD
        time: '',
        message: ''
    });

    const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success' | 'error'>('idle');
    const [bookingError, setBookingError] = useState<string | null>(null);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<number | null>(null);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const dateFromUrl = urlParams.get('date');
        if (dateFromUrl) {
            setFormData(prev => ({ ...prev, date: dateFromUrl }));
            const dateObj = new Date(dateFromUrl);
            setCurrentDate(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
            setSelectedDate(dateObj.getDate());
        }
    }, []);

    const fetchSlots = useCallback(async () => {
        const eventTypeId = SERVICE_TYPE_MAP[formData.service] || 5264837;

        if (!formData.service) return;

        setIsLoadingSlots(true);
        try {
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
            
            // Using our unified proxy endpoint (Cloudflare Function / Vite Dev Proxy)
            // This bypasses CORS and protects the API key by keeping it on the server
            const response = await fetch('/api/slots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eventTypeId,
                    startTime: startOfMonth,
                    endTime: endOfMonth
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Request failed with status ${response.status}`);
            }

            const data = await response.json();
            
            if (data.slots) {
                const formattedSlots: Record<string, string[]> = {};
                Object.keys(data.slots).forEach(date => {
                    formattedSlots[date] = data.slots[date].map((slot: any) => slot.time);
                });
                setAvailableSlots(formattedSlots);
            }
        } catch (error) {
            console.error("Failed to fetch slots through proxy:", error);
        } finally {
            setIsLoadingSlots(false);
        }
    }, [currentDate, formData.service]);

    useEffect(() => {
        if (step === 2 && formData.service) {
            fetchSlots();
        }
    }, [step, currentDate, formData.service, fetchSlots]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
        setFormData({ ...formData, date: '', time: '' });
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
        setFormData({ ...formData, date: '', time: '' });
    };

    const handleDateClick = (day: number) => {
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        const fullDate = `${currentDate.getFullYear()}-${month}-${dayStr}`;
        
        // Only allow click if date has slots
        if (!availableSlots[fullDate] || availableSlots[fullDate].length === 0) return;
        
        setSelectedDate(day);
        setFormData({ ...formData, date: fullDate, time: '' });
    };

    const handleFinish = async () => {
        setBookingStatus('booking');
        setBookingError(null);

        const eventTypeId = SERVICE_TYPE_MAP[formData.service] || 5265005;
        
        // Combined notes for Cal.com
        const notesContent = `Phone: ${formData.phone}\nService: ${formData.service}${formData.message ? `\n\nMessage: ${formData.message}` : ''}`;
        
        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eventTypeId,
                    startTime: formData.time, // ISO time from availableSlots
                    name: formData.name,
                    email: formData.email,
                    notes: notesContent,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                })
            });

            const data = await response.json();

            if (response.ok) {
                setBookingStatus('success');
            } else {
                setBookingStatus('error');
                setBookingError(data.error || 'Failed to complete booking. Please try again.');
            }
        } catch (error) {
            console.error("Failed to book through proxy:", error);
            setBookingStatus('error');
            setBookingError('A network error occurred. Please check your connection.');
        }
    };

    const steps = [
        { id: 1, name: 'SERVICE', icon: <Briefcase size={16} /> },
        { id: 2, name: 'DATE & TIME', icon: <CalendarIcon size={16} /> },
        { id: 3, name: 'DETAILS', icon: <User size={16} /> }
    ];

    const services = [
        "General Consultation",
        "Web Development",
        "UI/UX Design",
        "Mentorship",
        "Other"
    ];

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    return (
        <div className="bg-bg text-text-primary min-h-screen font-sans flex flex-col selection:bg-primary selection:text-black">
            <Navbar />

            <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-1/4 right-[-100px] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute bottom-1/4 left-[-100px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-5xl bg-bg-card rounded-[32px] overflow-hidden border border-border shadow-2xl flex flex-col md:flex-row min-h-[640px] relative z-10"
                >
                    
                    {/* LEFT SIDEBAR */}
                    <div className="w-full md:w-[280px] bg-bg-secondary p-8 md:p-10 flex flex-col justify-between border-r border-border">
                        <div>
                            <div className="mb-12">
                                <h1 className="text-2xl font-poppins font-bold tracking-tight text-text-primary">
                                    Booking<span className="text-primary italic font-light">Flow</span>
                                </h1>
                                <div className="w-8 h-1 bg-primary rounded-full mt-2" />
                            </div>

                            <div className="space-y-10 relative">
                                <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-border" />
                                
                                {steps.map((s) => (
                                    <div key={s.id} className="flex items-center gap-4 group cursor-default">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all duration-300
                                            ${step > s.id ? 'bg-primary text-black' : 
                                              step === s.id ? 'bg-primary text-black scale-110 shadow-[0_0_20px_rgba(61,188,255,0.4)]' : 
                                              'bg-bg-card text-text-secondary border border-border'}
                                        `}>
                                            {step > s.id ? <Check size={14} strokeWidth={3} /> : s.id}
                                        </div>
                                        <span className={`
                                            text-xs font-bold tracking-[0.1em] transition-colors duration-300
                                            ${step === s.id ? 'text-text-primary' : 'text-text-secondary'}
                                        `}>
                                            {s.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-20 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                            <p className="text-text-secondary text-[10px] font-bold tracking-widest uppercase mb-2">Need help?</p>
                            <p className="text-primary text-sm font-bold tracking-tight">+1 (234) 567-8900</p>
                        </div>
                    </div>

                    {/* RIGHT CONTENT */}
                    <div className="flex-grow bg-bg-card p-8 md:p-14 flex flex-col justify-between">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="flex-grow"
                            >
                                {bookingStatus === 'success' ? (
                                    <div className="flex flex-col items-center justify-center text-center space-y-8 py-10 h-full">
                                        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center relative shadow-[0_0_50px_rgba(61,188,255,0.2)]">
                                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                                            <Check size={48} className="text-primary stroke-[3]" />
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-4xl font-poppins font-bold text-text-primary">Booking Confirmed!</h2>
                                            <p className="text-text-secondary max-w-sm mx-auto">
                                                Thank you, <span className="text-primary font-bold">{formData.name}</span>. Your meeting for <span className="text-text-primary font-semibold">{formData.service}</span> has been successfully scheduled.
                                            </p>
                                        </div>
                                        <div className="bg-bg-secondary p-6 rounded-3xl border border-border w-full max-w-md">
                                            <div className="grid grid-cols-2 gap-4 text-xs font-bold tracking-widest text-text-secondary uppercase">
                                                <div className="text-left">
                                                    <p className="mb-1 opacity-50">Date</p>
                                                    <p className="text-text-primary font-poppins text-sm">{new Date(formData.time).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="mb-1 opacity-50">Time</p>
                                                    <p className="text-text-primary font-poppins text-sm">{formatTime(formData.time)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => window.location.href = '/'}
                                            className="px-10 py-5 bg-primary text-black rounded-2xl text-[10px] font-extrabold tracking-[.25em] hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(61,188,255,0.3)] uppercase"
                                        >
                                            Return to Home
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                {step === 1 && (
                                    <div>
                                        <div className="mb-8">
                                            <h2 className="text-3xl font-poppins font-bold text-text-primary mb-2">Select Service</h2>
                                            <p className="text-text-secondary text-sm">Choose the category that best fits your needs.</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-3">
                                            {services.map((service) => (
                                                <button
                                                    key={service}
                                                    onClick={() => {
                                                        setFormData({ ...formData, service });
                                                        setStep(2);
                                                    }}
                                                    className={`
                                                        w-full text-left p-5 rounded-2xl border transition-all duration-300 group flex justify-between items-center
                                                        ${formData.service === service 
                                                            ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(61,188,255,0.05)]' 
                                                            : 'border-border hover:border-primary/50 hover:bg-bg-secondary'}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-lg ${formData.service === service ? 'bg-primary/20 text-primary' : 'bg-bg-secondary text-text-secondary'}`}>
                                                            <Briefcase size={18} />
                                                        </div>
                                                        <span className={`font-medium ${formData.service === service ? 'text-primary' : 'text-text-primary'}`}>
                                                            {service}
                                                        </span>
                                                    </div>
                                                    <div className={`
                                                        w-5 h-5 rounded-full border flex items-center justify-center transition-all
                                                        ${formData.service === service ? 'border-primary bg-primary' : 'border-border'}
                                                    `}>
                                                        {formData.service === service && <Check size={12} className="text-black" strokeWidth={4} />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="relative">
                                        <div className="mb-8">
                                            <h2 className="text-3xl font-poppins font-bold text-text-primary mb-2">Date & Time</h2>
                                            <p className="text-text-secondary text-sm">Real-time availability from Cal.com.</p>
                                        </div>

                                        <div className="flex flex-col lg:flex-row gap-10">
                                            {/* Calendar Section */}
                                            <div className="flex-grow max-w-sm">
                                                <h3 className="text-[10px] font-bold tracking-[0.2em] text-text-secondary mb-4 uppercase">Select Date</h3>
                                                <div className="p-6 bg-bg-secondary border border-border rounded-3xl relative">
                                                    {isLoadingSlots && (
                                                        <div className="absolute inset-0 z-20 bg-bg-secondary/60 backdrop-blur-[1px] flex items-center justify-center rounded-3xl">
                                                            <Loader2 size={32} className="text-primary animate-spin" />
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between mb-6">
                                                        <span className="font-poppins text-sm font-bold">
                                                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <button onClick={handlePrevMonth} className="p-2 hover:bg-bg-card rounded-xl transition-colors text-text-secondary hover:text-primary border border-border">
                                                                <ChevronLeft size={16} />
                                                            </button>
                                                            <button onClick={handleNextMonth} className="p-2 hover:bg-bg-card rounded-xl transition-colors text-text-secondary hover:text-primary border border-border">
                                                                <ChevronRight size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                                        {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => (
                                                            <div key={d} className="text-[9px] font-bold text-text-secondary/30 text-center">{d}</div>
                                                        ))}
                                                    </div>
                                                    <div className="grid grid-cols-7 gap-1">
                                                        {[...Array(firstDayOfMonth)].map((_, i) => (
                                                            <div key={`empty-${i}`} className="h-10 w-10" />
                                                        ))}
                                                        {[...Array(daysInMonth)].map((_, i) => {
                                                            const day = i + 1;
                                                            const monthStr = (currentDate.getMonth() + 1).toString().padStart(2, '0');
                                                            const dayStr = day.toString().padStart(2, '0');
                                                            const fullDateString = `${currentDate.getFullYear()}-${monthStr}-${dayStr}`;
                                                            
                                                            const isAvailable = availableSlots[fullDateString] && availableSlots[fullDateString].length > 0;
                                                            const isSelected = selectedDate === day;
                                                            
                                                            return (
                                                                <button
                                                                    key={day}
                                                                    onClick={() => handleDateClick(day)}
                                                                    disabled={!isAvailable}
                                                                    className={`
                                                                        h-10 w-10 rounded-xl flex items-center justify-center text-xs font-semibold transition-all relative
                                                                        ${!isAvailable ? 'text-text-secondary/10 cursor-not-allowed' : 
                                                                          isSelected ? 'bg-primary text-black shadow-[0_0_15px_rgba(61,188,255,0.3)]' : 'hover:bg-bg-card text-text-primary border border-primary/20 hover:border-primary/50'}
                                                                    `}
                                                                >
                                                                    {day}
                                                                    {isAvailable && !isSelected && (
                                                                        <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Timeslots Section */}
                                            <div className="w-full lg:w-48">
                                                <h3 className="text-[10px] font-bold tracking-[0.2em] text-text-secondary mb-4 uppercase">Slots for {selectedDate ? `${monthNames[currentDate.getMonth()]} ${selectedDate}` : '...'}</h3>
                                                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                                    {!selectedDate ? (
                                                        <div className="text-xs text-text-secondary/50 py-10 text-center border border-dashed border-border rounded-xl">
                                                            Select a date first
                                                        </div>
                                                    ) : (
                                                        (availableSlots[formData.date] || []).map((slot) => (
                                                            <button
                                                                key={slot}
                                                                onClick={() => setFormData({ ...formData, time: slot })}
                                                                className={`
                                                                    py-4 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2
                                                                    ${formData.time === slot 
                                                                        ? 'border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(61,188,255,0.05)]' 
                                                                        : 'border-border hover:border-primary/30 bg-bg-secondary text-text-secondary'}
                                                                `}
                                                            >
                                                                <Clock size={12} />
                                                                {formatTime(slot)}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-8">
                                        <div className="mb-2">
                                            <h2 className="text-3xl font-poppins font-bold text-text-primary mb-2">Final Details</h2>
                                            <p className="text-text-secondary text-sm">Successfully synced with Cal.com. Confirm below.</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold tracking-widest text-text-secondary uppercase ml-1">Full Name</label>
                                                <div className="relative group">
                                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary transition-colors group-focus-within:text-primary" />
                                                    <input 
                                                        type="text" 
                                                        required
                                                        value={formData.name}
                                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                                        className="w-full bg-bg-secondary border border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary transition-all text-text-primary placeholder:text-text-secondary/30 font-semibold"
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold tracking-widest text-text-secondary uppercase ml-1">Email Address</label>
                                                    <div className="relative group">
                                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary transition-colors group-focus-within:text-primary" />
                                                        <input 
                                                            type="email" 
                                                            required
                                                            value={formData.email}
                                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                                            className="w-full bg-bg-secondary border border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary transition-all text-text-primary placeholder:text-text-secondary/30 font-semibold"
                                                            placeholder="john@example.com"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold tracking-widest text-text-secondary uppercase ml-1">Phone Number</label>
                                                    <div className="relative group">
                                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary transition-colors group-focus-within:text-primary" />
                                                        <input 
                                                            type="tel" 
                                                            required
                                                            value={formData.phone}
                                                            onChange={e => setFormData({...formData, phone: e.target.value})}
                                                            className="w-full bg-bg-secondary border border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary transition-all text-text-primary placeholder:text-text-secondary/30 font-semibold"
                                                            placeholder="+1 (555) 000-0000"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold tracking-widest text-text-secondary uppercase ml-1">Message (Optional)</label>
                                                <textarea 
                                                    rows={3}
                                                    value={formData.message}
                                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                                    className="w-full bg-bg-secondary border border-border rounded-2xl p-5 focus:outline-none focus:border-primary transition-all text-text-primary placeholder:text-text-secondary/30 font-semibold resize-none"
                                                    placeholder="Tell me a bit about your project or what you'd like to discuss..."
                                                />
                                            </div>
                                        </div>

                                        <div className="p-6 bg-primary/5 border border-primary/20 rounded-[28px] relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Check size={80} className="text-primary" />
                                            </div>
                                            <h4 className="text-[10px] font-bold tracking-widest text-primary mb-4 uppercase">Confirmation Details</h4>
                                            <div className="flex flex-wrap gap-x-8 gap-y-4 relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                                                        <Briefcase size={14} />
                                                    </div>
                                                    <span className="text-sm font-semibold">{formData.service}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                                                        <CalendarIcon size={14} />
                                                    </div>
                                                    <span className="text-sm font-semibold">
                                                        {selectedDate ? `${monthNames[currentDate.getMonth()]} ${selectedDate}, ${currentDate.getFullYear()}` : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                                                        <Clock size={14} />
                                                    </div>
                                                    <span className="text-sm font-semibold">{formData.time ? formatTime(formData.time) : '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {bookingStatus === 'error' && (
                                    <div className="mt-6 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400">
                                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                            <span className="font-bold text-lg">!</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold tracking-widest uppercase mb-1">Booking failed</p>
                                            <p className="text-sm font-medium">{bookingError}</p>
                                        </div>
                                    </div>
                                )}
                                </>)}
                            </motion.div>
                        </AnimatePresence>

                        {/* NAV BUTTONS */}
                        {bookingStatus !== 'success' && (
                        <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
                            <button
                                onClick={() => setStep(prev => prev > 1 ? (prev - 1 as any) : 1)}
                                className={`text-[10px] font-bold tracking-[0.3em] flex items-center gap-2 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-text-secondary hover:text-text-primary'}`}
                            >
                                <ChevronLeft size={16} /> BACK
                            </button>
                            
                            <button
                                onClick={() => {
                                    if (step === 1 && formData.service) setStep(2);
                                    else if (step === 2 && formData.date && formData.time) setStep(3);
                                    else if (step === 3 && formData.name && formData.email) handleFinish();
                                }}
                                disabled={
                                    (step === 1 && !formData.service) ||
                                    (step === 2 && (!formData.date || !formData.time)) ||
                                    (step === 3 && (!formData.name || !formData.email)) ||
                                    isLoadingSlots ||
                                    bookingStatus === 'booking'
                                }
                                className={`
                                    group flex items-center justify-center gap-3 bg-primary text-black px-8 py-5 rounded-2xl text-[10px] font-extrabold tracking-[.25em] transition-all
                                    ${((step === 1 && !formData.service) || (step === 2 && (!formData.date || !formData.time)) || (step === 3 && (!formData.name || !formData.email)) || isLoadingSlots || bookingStatus === 'booking') 
                                        ? 'opacity-20 grayscale cursor-not-allowed' 
                                        : 'hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(61,188,255,0.3)] active:scale-[0.98]'}
                                `}
                            >
                                {bookingStatus === 'booking' ? 'CONFIRMING...' : isLoadingSlots ? 'SYNCING...' : step === 3 ? 'FINALIZE BOOKING' : 'CONTINUE'}
                                {(bookingStatus !== 'booking' && !isLoadingSlots) && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                                {bookingStatus === 'booking' && <Loader2 size={16} className="animate-spin" />}
                            </button>
                        </div>
                        )}
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default BookingPage;
