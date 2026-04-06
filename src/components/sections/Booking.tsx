import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';

const Booking: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handleDateClick = (day: number) => {
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dateStr = `${currentDate.getFullYear()}-${month}-${dayStr}`;
    
    // Redirect to Cal.com with the selected date
    window.open(`https://cal.com/ambagan-shaq-lee-r-in8dyi/30min?date=${dateStr}`, '_blank');
  };

  return (
    <section id="booking" className="bg-bg text-text-primary py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute top-0 right-[-100px] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="container mx-auto max-w-7xl px-6 lg:px-4 relative z-10">
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="flex items-end gap-4 mb-4">
            <span className="text-primary text-3xl lg:text-4xl font-bold font-poppins leading-none">05.</span>
            <h2 className="text-3xl lg:text-4xl font-bold font-poppins leading-none">Book an Appointment</h2>
          </div>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Select a date below that works best for you and let's get connected.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-bg-card/80 backdrop-blur-xl border border-border p-6 md:p-10 rounded-3xl shadow-2xl relative">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-xl text-primary">
                <CalendarIcon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-poppins text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <p className="text-text-secondary text-sm">Pick an available day</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 border border-border rounded-xl hover:bg-bg transition-colors hover:text-primary">
                <ChevronLeft size={20} />
              </button>
              <button onClick={handleNextMonth} className="p-2 border border-border rounded-xl hover:bg-bg transition-colors hover:text-primary">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-2 mb-2 font-medium text-center text-text-secondary text-sm">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 lg:gap-3">
            {[...Array(firstDayOfMonth)].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1) < new Date();
              
              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  disabled={isPast}
                  className={`
                    aspect-square rounded-xl flex items-center justify-center font-medium transition-all group relative
                    ${isPast 
                      ? 'text-text-secondary/30 cursor-not-allowed opacity-50' 
                      : 'hover:bg-primary/20 text-white hover:text-primary border border-transparent hover:border-primary/30 bg-bg'
                    }
                  `}
                >
                  <span className="relative z-10">{day}</span>
                  {!isPast && (
                     <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-primary text-black rounded-xl transition-all scale-90 group-hover:scale-100">
                        <ExternalLink size={16} />
                     </div>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Booking;
