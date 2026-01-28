import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './App.css'; 

// Importamos los componentes (asegúrate de que las rutas sean correctas)
import HomeView from './components/HomeView';
import BookingForm from './components/BookingForm';

function App() {
  // --- ESTADO GLOBAL ---
  const [currentScreen, setCurrentScreen] = useState('home');
  const [installPrompt, setInstallPrompt] = useState(null);
  
  // Cargamos reservas (LocalStorage)
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('hotelBookings');
    return saved ? JSON.parse(saved) : [];
  });

  // Guardamos en LocalStorage cuando cambia bookings
  useEffect(() => {
    localStorage.setItem('hotelBookings', JSON.stringify(bookings));
  }, [bookings]);

  // --- NAVEGACIÓN ---
  useEffect(() => {
    const handlePopState = () => {
      if (currentScreen !== 'home') setCurrentScreen('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentScreen]);

  const navigateTo = (screenName) => {
    window.history.pushState({ screen: screenName }, '', ''); 
    setCurrentScreen(screenName);
  };

  const goBack = () => window.history.back();

  // --- LÓGICA DE NEGOCIO (ACCIONES) ---

  const addBooking = (bookingData) => {
    // Agregamos ID único y guardamos
    setBookings(prev => [...prev, { ...bookingData, id: Date.now() }]);
    goBack(); // Volvemos al home
    Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: '#1e293b', color: '#fff' }).fire({ icon: 'success', title: 'Reserva Guardada' });
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

  // --- LÓGICA PWA ---
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then(() => setInstallPrompt(null));
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-4 font-sans">
      
      {/* Header Común */}
      <header className="w-full max-w-md text-center py-6 mb-4 relative">
        <h1 className="text-2xl font-bold tracking-wide uppercase text-slate-100 drop-shadow-md flex items-center justify-center gap-3">
            <i className="fi fi-ss-house-chimney text-green-400 text-3xl"></i>
            App Reservas
        </h1>
        {installPrompt && (
          <button onClick={handleInstallClick} className="mt-4 bg-linear-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
            📲 Instalar App
          </button>
        )}
      </header>

      {/* RENDERIZADO CONDICIONAL DE PANTALLAS */}
      {currentScreen === 'home' && (
        <HomeView 
            bookings={bookings} 
            onDeleteBooking={deleteBooking} 
            onNavigateToAdd={() => navigateTo('add')} 
        />
      )}

      {currentScreen === 'add' && (
        <BookingForm 
            onSave={addBooking} 
            onCancel={goBack} 
        />
      )}

      <footer className="mt-auto w-full max-w-md bg-slate-900 rounded-xl border border-slate-800 p-4 text-center mb-2">
        <p className="text-slate-500 text-sm">Creado por Daniel Antequera</p>
      </footer>
    </div>
  );
}

export default App;