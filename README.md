# 🏨 Organizador de Huéspedes (Hotel Manager PWA)

Una aplicación web progresiva (PWA) diseñada para gestionar reservas de propiedades de alquiler temporal o casas de fin de semana de forma sencilla, visual y 100% offline.

Desarrollado por **Daniel Antequera (Dsniel.Dev)**.

## 🚀 Características Principales

- **📅 Calendario Visual:** Visualización rápida de fechas libres (sin marcar) y ocupadas (rojo).
- **👤 Gestión de Huéspedes:** Registro de nombre, teléfono y fechas de entrada/salida.
- **💰 Control Financiero:** Cálculo automático del saldo pendiente (Total - Seña/Adelanto).
- **📲 Integración con WhatsApp:** Botón directo para enviar mensajes al cliente sin agendarlo.
- **💾 Persistencia Local:** Los datos se guardan en el `localStorage` del dispositivo (no requiere base de datos ni internet).
- **📱 PWA Instalable:** Se puede instalar como una app nativa en Android/iOS y funciona sin conexión.
- **🌙 Modo Oscuro:** Interfaz limpia y moderna construida con Tailwind CSS.

## 🛠️ Tecnologías Utilizadas

- **React + Vite:** Framework y empaquetador para un desarrollo veloz.
- **Tailwind CSS:** Estilizado moderno y responsivo.
- **React-Calendar:** Componente base para la lógica del calendario.
- **SweetAlert2:** Alertas y modales interactivos y elegantes.
- **Vite Plugin PWA:** Motor para convertir la web en una aplicación instalable.

## 📦 Instalación y Despliegue Local

Sigue estos pasos para correr el proyecto en tu computadora:

1. **Clonar el repositorio:**
   ```bash
   git clone <TU_URL_DEL_REPOSITORIO>
   cd app-manejo-huesped

   Uso
Nueva Reserva: Toca el botón "Nueva Reserva", llena los datos del huésped y el monto pactado.

Ver Detalles: Toca cualquier fecha marcada en rojo en el calendario para ver quién ocupa la casa y cuánto debe.

Contactar: Usa el botón de WhatsApp en el detalle para escribirle al inquilino.

Cancelar: Si cancelan, puedes borrar la reserva desde el detalle del día, liberando las fechas en el calendario.

© 2025 Daniel Antequera Todos los derechos reservados.
