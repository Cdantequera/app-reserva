import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import Swal from 'sweetalert2';
import 'react-calendar/dist/Calendar.css';
import './App.css'; // Asegúrate de tener los estilos base aquí o en index.css

function App() {

  // --- 1. CONFIGURACIÓN INICIAL ---
  const [date, setDate] = useState(new Date());
  const [currentScreen, setCurrentScreen] = useState('home');
  const [installPrompt, setInstallPrompt] = useState(null);

  // --- 2. ESTADO PARA LAS RESERVAS ---
  // Estructura: { id, guestName, phone, startDate, endDate, totalCost, deposit, status }
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('hotelBookings');
    return saved ? JSON.parse(saved) : [];
  });

  // Estados para el formulario de nueva reserva
  const [newBooking, setNewBooking] = useState({
    guestName: '',
    phone: '',
    startDate: '',
    endDate: '',
    totalCost: '',
    deposit: ''
  });

  useEffect(() => {
    localStorage.setItem('hotelBookings', JSON.stringify(bookings));
  }, [bookings]);

  // --- 3. MANEJO DEL BOTÓN "ATRÁS" (Igual que tu App original) ---
  useEffect(() => {
    const handlePopState = () => {
      if (currentScreen !== 'home') {
        setCurrentScreen('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentScreen]);

  const navigateTo = (screenName) => {
    window.history.pushState({ screen: screenName }, '', ''); 
    setCurrentScreen(screenName);
  };

  const goBack = () => {
    window.history.back();
  };

  // --- LÓGICA DE INSTALACIÓN PWA ---
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then(() => {
      setInstallPrompt(null);
    });
  };

  // --- LÓGICA DE FECHAS Y RESERVAS ---

  // Verifica si una fecha específica está ocupada
  const getBookingForDate = (checkDate) => {
    return bookings.find(b => {
      const start = new Date(b.startDate);
      // Ajustamos hora para evitar problemas de zona horaria al comparar
      start.setHours(0,0,0,0);
      const end = new Date(b.endDate);
      end.setHours(23,59,59,999);
      
      const current = new Date(checkDate);
      current.setHours(12,0,0,0); // Mediodía para asegurar que cae dentro
      
      return current >= start && current <= end;
    });
  };

  // Pinta el calendario: Rojo si ocupado, Verde si es el día seleccionado libre
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const booking = getBookingForDate(date);
      if (booking) {
        return 'bg-red-900 text-white rounded-full font-bold opacity-80'; // Clase CSS personalizada (Tailwind no aplica directo aquí a veces, pero intentamos)
      }
    }
    return null;
  };

  // --- ACCIONES ---

  const handleSaveBooking = () => {
    if (!newBooking.guestName || !newBooking.startDate || !newBooking.endDate) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Nombre y fechas son obligatorios', background: '#1e293b', color: '#fff' });
      return;
    }

    const total = parseFloat(newBooking.totalCost) || 0;
    const dep = parseFloat(newBooking.deposit) || 0;

    Swal.fire({
      title: '¿Confirmar Reserva?',
      html: `
        <div style="text-align:left; color:#cbd5e1;">
          <p>👤 <b>${newBooking.guestName}</b></p>
          <p>📅 Desde: ${newBooking.startDate}</p>
          <p>📅 Hasta: ${newBooking.endDate}</p>
          <hr style="margin: 10px 0; border-color: #334155;">
          <p>💰 Total: <b style="color:#4ade80">$${total}</b></p>
          <p>💵 Seña: <b style="color:#f87171">$${dep}</b></p>
          <p>❗ Resta: <b style="color:#fbbf24">$${total - dep}</b></p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Guardar',
      background: '#0f172a',
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        setBookings(prev => [...prev, { ...newBooking, id: Date.now() }]);
        setNewBooking({ guestName: '', phone: '', startDate: '', endDate: '', totalCost: '', deposit: '' });
        goBack();
        Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: '#1e293b', color: '#fff' }).fire({ icon: 'success', title: 'Reserva Guardada' });
      }
    });
  };

  const deleteBooking = (id) => {
    Swal.fire({
      title: '¿Cancelar Reserva?',
      text: "Esto liberará las fechas.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      background: '#0f172a',
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        setBookings(prev => prev.filter(b => b.id !== id));
        Swal.mixin({ toast: true, position: 'top-end', timer: 1500, showConfirmButton: false, background: '#1e293b', color: '#fff' }).fire({ icon: 'success', title: 'Eliminado' });
      }
    });
  };

  const openWhatsApp = (phone, name) => {
    if (!phone) return;
    // Limpiar el numero de caracteres no numéricos
    const cleanPhone = phone.replace(/\D/g, ''); 
    const url = `https://wa.me/${cleanPhone}?text=Hola ${name}, te escribo por tu reserva en la casa de fin de semana.`;
    window.open(url, '_blank');
  };

  // Datos para renderizar en HOME
  const activeBooking = getBookingForDate(date);
  const remainingPay = activeBooking ? (parseFloat(activeBooking.totalCost || 0) - parseFloat(activeBooking.deposit || 0)) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-4 font-sans">
      
      {/* --- HEADER --- */}
      <header className="w-full max-w-md text-center py-6 mb-4 relative">
        <h1 className="text-2xl font-bold tracking-wide uppercase text-slate-100 drop-shadow-md flex items-center justify-center gap-3">
            <i className="fi fi-ss-house-chimney text-green-400 text-3xl"></i>
            Hotel Manager
        </h1>
        {installPrompt && (
          <button 
            onClick={handleInstallClick}
            className="mt-4 bg-linear-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse"
          >
            📲 Instalar App
          </button>
        )}
      </header>

      {/* --- PANTALLA PRINCIPAL (HOME) --- */}
      {currentScreen === 'home' && (
        <>
          <div className="w-full max-w-md bg-slate-900 rounded-2xl p-4 shadow-lg border border-slate-800 mb-6 flex flex-col items-center justify-center relative">
            
            {/* --- CALENDARIO --- */}
            <div className="w-full mt-2 custom-calendar-wrapper">
               {/* Usamos tileClassName para marcar días ocupados */}
               <Calendar 
                  onChange={setDate} 
                  value={date} 
                  locale="es-ES" 
                  tileClassName={tileClassName}
               />
            </div>
            
            {/* --- DETALLE DEL DÍA SELECCIONADO --- */}
            <div className="mt-4 w-full border-t border-slate-800 pt-3">
                <p className="text-center text-slate-500 text-xs uppercase mb-2">Estado del {date.toLocaleDateString()}</p>
                
                {activeBooking ? (
                  <div className="bg-slate-800 rounded-xl p-4 border-l-4 border-red-500 animate-fade-in-up">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white">{activeBooking.guestName}</h3>
                        <p className="text-slate-400 text-sm">Salida: {new Date(activeBooking.endDate).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={() => openWhatsApp(activeBooking.phone, activeBooking.guestName)}
                        className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-full shadow-lg"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                      </button>
                    </div>
                    
                    <div className="mt-3 bg-slate-900 p-3 rounded-lg flex justify-between items-center">
                        <span className="text-slate-400 text-xs">Pago Pendiente:</span>
                        <span className={`font-bold text-lg ${remainingPay > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            ${remainingPay}
                        </span>
                    </div>

                    <button 
                      onClick={() => deleteBooking(activeBooking.id)}
                      className="w-full mt-3 py-2 text-xs text-red-400 border border-red-900/50 rounded hover:bg-red-900/20"
                    >
                      Cancelar Reserva
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed border-slate-700 rounded-xl">
                    <p className="text-green-400 font-bold text-lg">Día Libre</p>
                    <p className="text-slate-500 text-sm">No hay huéspedes registrados</p>
                  </div>
                )}
            </div>
          </div>

          {/* Botón de Acción */}
          <div className="w-full max-w-md mb-6">
            <button 
              onClick={() => navigateTo('add')}
              className="w-full py-4 bg-linear-to-r from-blue-700 to-blue-600 hover:from-blue-600 rounded-xl text-xl font-bold shadow-lg border-b-4 border-blue-900 flex items-center justify-center gap-2"
            >
              <span>📅</span> Nueva Reserva
            </button>
          </div>
        </>
      )}

      {/* --- PANTALLA DE CARGA (NUEVA RESERVA) --- */}
      {currentScreen === 'add' && (
        <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in-up">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h2 className="text-xl text-center mb-6 text-slate-300 font-bold">
              Datos del Huésped
            </h2>

            {/* Inputs */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={newBooking.guestName}
                  onChange={(e) => setNewBooking({...newBooking, guestName: e.target.value})}
                  className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase font-bold ml-1">Teléfono / WhatsApp</label>
                <input 
                  type="tel" 
                  value={newBooking.phone}
                  onChange={(e) => setNewBooking({...newBooking, phone: e.target.value})}
                  className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej. 549381..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-xs text-slate-500 uppercase font-bold ml-1">Entrada</label>
                    <input 
                      type="date" 
                      value={newBooking.startDate}
                      onChange={(e) => setNewBooking({...newBooking, startDate: e.target.value})}
                      className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700"
                    />
                 </div>
                 <div>
                    <label className="text-xs text-slate-500 uppercase font-bold ml-1">Salida</label>
                    <input 
                      type="date" 
                      value={newBooking.endDate}
                      onChange={(e) => setNewBooking({...newBooking, endDate: e.target.value})}
                      className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700"
                    />
                 </div>
              </div>

              <hr className="border-slate-800 my-2"/>

              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-xs text-slate-500 uppercase font-bold ml-1">Total a Cobrar</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500">$</span>
                        <input 
                          type="number" 
                          value={newBooking.totalCost}
                          onChange={(e) => setNewBooking({...newBooking, totalCost: e.target.value})}
                          className="w-full bg-slate-800 text-white p-2 pl-6 rounded-xl border border-slate-700"
                          placeholder="0"
                        />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs text-slate-500 uppercase font-bold ml-1">Seña / Pago</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500">$</span>
                        <input 
                          type="number" 
                          value={newBooking.deposit}
                          onChange={(e) => setNewBooking({...newBooking, deposit: e.target.value})}
                          className="w-full bg-slate-800 text-white p-2 pl-6 rounded-xl border border-slate-700"
                          placeholder="0"
                        />
                    </div>
                 </div>
              </div>

            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-8">
              <button onClick={goBack} className="flex-1 py-4 bg-transparent border-2 border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl text-lg font-bold">Cancelar</button>
              <button onClick={handleSaveBooking} className="flex-1 py-4 bg-slate-100 text-slate-900 hover:bg-white rounded-xl text-lg font-bold border-b-4 border-slate-400">GUARDAR</button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto w-full max-w-md bg-slate-900 rounded-xl border border-slate-800 p-4 text-center mb-2">
        <p className="text-slate-500 text-sm">Dsniel.Dev - Hotel Manager</p>
      </footer>
    </div>
  );
}

export default App;
