import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function HomeView({ bookings, onDeleteBooking, onNavigateToAdd }) {
  const [date, setDate] = useState(new Date());

  // Lógica local para saber si un día está ocupado
  const getBookingForDate = (checkDate) => {
    return bookings.find(b => {
      const start = new Date(b.startDate);
      start.setHours(0,0,0,0);
      const end = new Date(b.endDate);
      end.setHours(23,59,59,999);
      const current = new Date(checkDate);
      current.setHours(12,0,0,0); 
      return current >= start && current <= end;
    });
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month' && getBookingForDate(date)) {
      return 'bg-red-900 text-white rounded-full font-bold opacity-80'; 
    }
    return null;
  };

  const openWhatsApp = (phone, name) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, ''); 
    window.open(`https://wa.me/${cleanPhone}?text=Hola ${name}, te escribo por tu reserva.`, '_blank');
  };

  const activeBooking = getBookingForDate(date);
  const remainingPay = activeBooking ? (parseFloat(activeBooking.totalCost || 0) - parseFloat(activeBooking.deposit || 0)) : 0;

  return (
    <>
      <div className="w-full max-w-md bg-slate-900 rounded-2xl p-4 shadow-lg border border-slate-800 mb-6 flex flex-col items-center relative">
        <div className="w-full mt-2 custom-calendar-wrapper">
           <Calendar onChange={setDate} value={date} locale="es-ES" tileClassName={tileClassName} />
        </div>
        
        <div className="mt-4 w-full border-t border-slate-800 pt-3">
            <p className="text-center text-slate-500 text-xs uppercase mb-2">Estado del {date.toLocaleDateString()}</p>
            
            {activeBooking ? (
              <div className="bg-slate-800 rounded-xl p-4 border-l-4 border-red-500 animate-fade-in-up">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">{activeBooking.guestName}</h3>
                    <p className="text-slate-400 text-sm">Salida: {new Date(activeBooking.endDate).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => openWhatsApp(activeBooking.phone, activeBooking.guestName)} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <i className="fi fi-brands-whatsapp"></i> {/* O tu SVG aquí */}
                  </button>
                </div>
                
                <div className="mt-3 bg-slate-900 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-slate-400 text-xs">Resta:</span>
                    <span className={`font-bold text-lg ${remainingPay > 0 ? 'text-red-400' : 'text-green-400'}`}>${remainingPay}</span>
                </div>

                <button onClick={() => onDeleteBooking(activeBooking.id)} className="w-full mt-3 py-2 text-xs text-red-400 border border-red-900/50 rounded hover:bg-red-900/20">
                  Cancelar Reserva
                </button>
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-slate-700 rounded-xl">
                <p className="text-green-400 font-bold text-lg">Día Libre</p>
              </div>
            )}
        </div>
      </div>

      <div className="w-full max-w-md mb-6">
        <button onClick={onNavigateToAdd} className="w-full py-4 bg-linear-to-r from-blue-700 to-blue-600 hover:from-blue-600 rounded-xl text-xl font-bold shadow-lg border-b-4 border-blue-900 flex items-center justify-center gap-2">
          <span>📅</span> Nueva Reserva
        </button>
      </div>
    </>
  );
}

export default HomeView;