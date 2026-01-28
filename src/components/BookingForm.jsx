import React, { useState } from 'react';
import Swal from 'sweetalert2';

function BookingForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    guestName: '',
    phone: '',
    startDate: '',
    endDate: '',
    totalCost: '',
    deposit: ''
  });

  // --- CAMBIO 1: Obtener fecha de hoy formato YYYY-MM-DD ---
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Validaciones básicas
    if (!formData.guestName || !formData.startDate || !formData.endDate) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Nombre y fechas son obligatorios', background: '#1e293b', color: '#fff' });
      return;
    }

    // --- CAMBIO 2: Validación lógica extra (Backend style) ---
    // Aseguramos que la fecha de inicio no sea anterior a hoy (por si escriben manual)
    const start = new Date(formData.startDate);
    const now = new Date();
    now.setHours(0,0,0,0); // Ignoramos la hora actual, solo fecha
    
    // Le sumamos el timezone offset para evitar problemas de "ayer" por la zona horaria
    const startLocal = new Date(start.getTime() + start.getTimezoneOffset() * 60000);

    if (startLocal < now) {
       Swal.fire({ icon: 'error', title: 'Fecha Inválida', text: 'No puedes reservar en el pasado.', background: '#1e293b', color: '#fff' });
       return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        Swal.fire({ icon: 'error', title: 'Fecha Inválida', text: 'La salida debe ser posterior a la entrada.', background: '#1e293b', color: '#fff' });
        return;
    }
    // ---------------------------------------------------------

    const total = parseFloat(formData.totalCost) || 0;
    const dep = parseFloat(formData.deposit) || 0;

    Swal.fire({
      title: '¿Confirmar Reserva?',
      html: `
        <div style="text-align:left; color:#cbd5e1;">
          <p>👤 <b>${formData.guestName}</b></p>
          <p>📅 Desde: ${formData.startDate}</p>
          <p>📅 Hasta: ${formData.endDate}</p>
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
        onSave(formData);
      }
    });
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in-up">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="text-xl text-center mb-6 text-slate-300 font-bold">
          Datos del Huésped
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-slate-500 uppercase font-bold ml-1">Nombre Completo</label>
            <input 
              name="guestName" 
              type="text" 
              value={formData.guestName}
              onChange={handleChange}
              className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 uppercase font-bold ml-1">Teléfono</label>
            <input 
              name="phone" 
              type="tel" 
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Teléfono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-xs text-slate-500 uppercase font-bold ml-1">Entrada</label>
                <input 
                  name="startDate" 
                  type="date" 
                  min={today} /* <--- CAMBIO 3: Bloqueo visual fechas pasadas */
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700"
                />
             </div>
             <div>
                <label className="text-xs text-slate-500 uppercase font-bold ml-1">Salida</label>
                <input 
                  name="endDate" 
                  type="date" 
                  min={formData.startDate || today} /* <--- CAMBIO 4: Bloqueo dinámico */
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-xs text-slate-500 uppercase font-bold ml-1">Total</label>
                <input 
                  name="totalCost" 
                  type="number" 
                  value={formData.totalCost}
                  onChange={handleChange}
                  className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700"
                  placeholder="0"
                />
             </div>
             <div>
                <label className="text-xs text-slate-500 uppercase font-bold ml-1">Seña</label>
                <input 
                  name="deposit" 
                  type="number" 
                  value={formData.deposit}
                  onChange={handleChange}
                  className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700"
                  placeholder="0"
                />
             </div>
          </div>

        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onCancel} className="flex-1 py-4 bg-transparent border-2 border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl text-lg font-bold">Cancelar</button>
          <button onClick={handleSubmit} className="flex-1 py-4 bg-slate-100 text-slate-900 hover:bg-white rounded-xl text-lg font-bold border-b-4 border-slate-400">GUARDAR</button>
        </div>
      </div>
    </div>
  );
}

export default BookingForm;