// Configuración
const API_BASE = window.location.origin;
let isSubmitting = false;

// Elementos del DOM
const form = document.getElementById('registroForm');
const mensaje = document.getElementById('mensaje');
const submitBtn = form.querySelector('button[type="submit"]');
const originalBtnText = submitBtn.innerHTML;

// Funciones de utilidad
const mostrarMensaje = (texto, tipo = 'success') => {
  mensaje.className = `mensaje ${tipo}`;
  mensaje.textContent = texto;
  mensaje.style.display = 'block';
  
  // Auto-hide después de 5 segundos para mensajes de éxito
  if (tipo === 'success') {
    setTimeout(() => {
      mensaje.style.display = 'none';
    }, 5000);
  }
};

const mostrarCargando = (mostrar = true) => {
  if (mostrar) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
    submitBtn.style.opacity = '0.7';
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
    submitBtn.style.opacity = '1';
  }
};

const limpiarMensajes = () => {
  mensaje.style.display = 'none';
  mensaje.className = 'mensaje';
};

const validarFormulario = (datos) => {
  const errores = [];
  
  if (!datos.nombre || datos.nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }
  
  if (datos.nombre && datos.nombre.trim().length > 100) {
    errores.push('El nombre no puede exceder 100 caracteres');
  }
  
  if (!datos.iglesia || datos.iglesia.trim().length < 3) {
    errores.push('El nombre de la iglesia debe tener al menos 3 caracteres');
  }
  
  if (datos.iglesia && datos.iglesia.trim().length > 150) {
    errores.push('El nombre de la iglesia no puede exceder 150 caracteres');
  }
  
  if (datos.email && datos.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(datos.email.trim())) {
      errores.push('El formato del email no es válido');
    }
  }
  
  return errores;
};

const manejarErrores = (error, response = null) => {
  console.error('Error:', error);
  
  if (response) {
    // Error de respuesta del servidor
    response.json()
      .then(data => {
        mostrarMensaje(data.error || 'Error al procesar el registro', 'error');
      })
      .catch(() => {
        mostrarMensaje('Error de comunicación con el servidor', 'error');
      });
  } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
    // Error de red
    mostrarMensaje('Sin conexión a internet. Verifica tu conexión e intenta nuevamente.', 'error');
  } else {
    // Error genérico
    mostrarMensaje('Ocurrió un error inesperado. Por favor intenta nuevamente.', 'error');
  }
};

// Evento principal del formulario
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Prevenir múltiples envíos
  if (isSubmitting) return;
  
  limpiarMensajes();
  
  // Obtener datos del formulario
  const formData = new FormData(form);
  const datos = {
    nombre: document.getElementById('nombre').value,
    iglesia: document.getElementById('iglesia').value,
    email: document.getElementById('email').value
  };
  
  // Validación del lado del cliente
  const erroresValidacion = validarFormulario(datos);
  if (erroresValidacion.length > 0) {
    mostrarMensaje(erroresValidacion[0], 'error');
    return;
  }
  
  isSubmitting = true;
  mostrarCargando(true);
  
  try {
    const response = await fetch(`${API_BASE}/registrar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Éxito
      mostrarMensaje(data.mensaje, 'success');
      form.reset();
      
      // Confetti o celebración (opcional)
      if (typeof confetti !== 'undefined') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      // Scroll al mensaje para móviles
      mensaje.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
    } else {
      // Error del servidor
      manejarErrores(null, Promise.resolve(response));
    }
    
  } catch (error) {
    manejarErrores(error);
  } finally {
    isSubmitting = false;
    mostrarCargando(false);
  }
});

// Validación en tiempo real (opcional)
const inputs = form.querySelectorAll('input[required]');
inputs.forEach(input => {
  input.addEventListener('blur', () => {
    if (input.value.trim() === '') {
      input.style.borderColor = '#e74c3c';
    } else {
      input.style.borderColor = '#27ae60';
    }
  });
  
  input.addEventListener('input', () => {
    if (input.style.borderColor === 'rgb(231, 76, 60)') {
      input.style.borderColor = '#ccc';
    }
  });
});

// Prevenir zoom en iOS
const emailInput = document.getElementById('email');
if (emailInput && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
  emailInput.addEventListener('focus', () => {
    emailInput.style.fontSize = '16px';
  });
}

// Service Worker para PWA (opcional)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registrado:', registration);
      })
      .catch(error => {
        console.log('SW falló:', error);
      });
  });
}

// Detección de conexión
window.addEventListener('online', () => {
  mostrarMensaje('Conexión restaurada', 'success');
});

window.addEventListener('offline', () => {
  mostrarMensaje('Sin conexión a internet', 'warning');
});

// Función para obtener estadísticas (opcional)
const cargarEstadisticas = async () => {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    if (response.ok) {
      const stats = await response.json();
      console.log(`Total de registros: ${stats.total}`);
      
      // Mostrar en algún lugar de la UI si es necesario
      const statsElement = document.getElementById('stats');
      if (statsElement) {
        statsElement.textContent = `Total de registros: ${stats.total}`;
      }
    }
  } catch (error) {
    console.log('Error cargando estadísticas:', error);
  }
};

// Auto-capitalizar nombres
document.getElementById('nombre').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\b\w/g, l => l.toUpperCase());
});

document.getElementById('iglesia').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\b\w/g, l => l.toUpperCase());
});

// Cargar estadísticas al inicio (opcional)
// cargarEstadisticas();