// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado correctamente');
  
  // Seleccionar elementos
  const form = document.getElementById("registroForm");
  const mensaje = document.getElementById("mensaje");
  const loadingOverlay = document.getElementById("loading");
  const btnSubmit = document.getElementById("btnSubmit");

  // Verificar que todos los elementos existen
  if (!form) {
    console.error('❌ Formulario no encontrado');
    return;
  }
  if (!mensaje) {
    console.error('❌ Elemento mensaje no encontrado');
    return;
  }
  if (!loadingOverlay) {
    console.error('❌ Loading overlay no encontrado');
    return;
  }
  if (!btnSubmit) {
    console.error('❌ Botón submit no encontrado');
    return;
  }

  console.log('✅ Todos los elementos encontrados');

  // URL de tu Google Apps Script Web App
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxFlzHwkWMzspVvmXcKrO0JlX4DqEKLvS9VK2EITsRQY7vl8i6W7EcDfwUxFNLQ1qxk/exec";

  // Función para mostrar mensajes
  function mostrarMensaje(texto, tipo) {
    console.log(`Mostrando mensaje: ${tipo} - ${texto}`);
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
    mensaje.style.display = "block";
    
    // Auto-ocultar después de 8 segundos si es éxito
    if (tipo === "success") {
      setTimeout(() => {
        mensaje.style.display = "none";
      }, 8000);
    }
  }

  // Función para validar formulario
  function validarFormulario(datos) {
    const errores = [];
    
    if (!datos.nombre || datos.nombre.length < 2) {
      errores.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (!datos.apellido || datos.apellido.length < 2) {
      errores.push('El apellido debe tener al menos 2 caracteres');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!datos.email || !emailRegex.test(datos.email)) {
      errores.push('El correo electrónico no es válido');
    }
    
    if (!datos.telefono || datos.telefono.length < 8) {
      errores.push('El teléfono debe tener al menos 8 caracteres');
    }
    
    if (!datos.iglesia || datos.iglesia.length < 3) {
      errores.push('El nombre de la iglesia debe tener al menos 3 caracteres');
    }
    
    return errores;
  }

  // Event listener para el formulario
  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    console.log('🚀 Formulario enviado');

    // Ocultar mensaje anterior y mostrar loading
    mensaje.style.display = "none";
    loadingOverlay.style.display = "block";
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    // Recopilar datos del formulario
    const datos = {
      nombre: form.nombre.value.trim(),
      apellido: form.apellido.value.trim(),
      email: form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      iglesia: form.iglesia.value.trim(),
  };


    console.log('📝 Datos recopilados:', datos);

    // Validar formulario
    const errores = validarFormulario(datos);
    if (errores.length > 0) {
      console.error('❌ Errores de validación:', errores);
      loadingOverlay.style.display = "none";
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i class="fas fa-check-circle"></i> Confirmar Asistencia';
      mostrarMensaje(`Por favor corrige: ${errores.join(', ')}`, "error");
      return;
    }

    try {
      console.log('📡 Enviando datos a:', SCRIPT_URL);
      
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
        mode: 'cors'
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      // Intentar obtener el texto de la respuesta
      const responseText = await response.text();
      console.log('📄 Response text:', responseText);

      // Intentar parsear como JSON
      let jsonResult;
      try {
        jsonResult = JSON.parse(responseText);
        console.log('✅ JSON parseado:', jsonResult);
      } catch (parseError) {
        console.error('❌ Error parseando JSON:', parseError);
        console.log('📄 Respuesta cruda:', responseText);
        
        // Si la respuesta contiene HTML, probablemente hay un error de autenticación
        if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
          throw new Error('Error de autenticación en Google Apps Script. Verifica los permisos.');
        }
        
        throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}`);
      }

      // Verificar el resultado
      if (jsonResult && jsonResult.result === "success") {
        console.log('🎉 Éxito!');
        mostrarMensaje("¡Registro enviado con éxito! Gracias por confirmar tu asistencia. Te esperamos en la cena.", "success");
        form.reset();
        
        // Confetti effect (opcional)
        if (typeof confetti !== 'undefined') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        
      } else {
        console.error('❌ Error del servidor:', jsonResult);
        throw new Error(jsonResult?.message || jsonResult?.error || "Error desconocido en el servidor");
      }

    } catch (error) {
      console.error('💥 Error completo:', error);
      console.error('💥 Stack trace:', error.stack);
      
      let mensajeError = "Error enviando los datos. ";
      
      if (error.message.includes('fetch')) {
        mensajeError += "Problema de conexión. Verifica tu internet.";
      } else if (error.message.includes('autenticación')) {
        mensajeError += "Problema de configuración del servidor.";
      } else if (error.message.includes('CORS')) {
        mensajeError += "Problema de permisos del servidor.";
      } else {
        mensajeError += error.message;
      }
      
      mensajeError += " Por favor, intenta nuevamente o contacta al administrador.";
      
      mostrarMensaje(mensajeError, "error");
      
    } finally {
      // Siempre ocultar loading y restaurar botón
      loadingOverlay.style.display = "none";
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i class="fas fa-check-circle"></i> Confirmar Asistencia';
      console.log('🏁 Proceso finalizado');
    }
  });

  // Validación en tiempo real
  const inputs = form.querySelectorAll('input[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value.trim() === '') {
        this.style.borderColor = 'var(--color-error)';
      } else {
        this.style.borderColor = 'var(--color-success)';
      }
    });
    
    input.addEventListener('input', function() {
      if (this.style.borderColor === 'var(--color-error)' && this.value.trim() !== '') {
        this.style.borderColor = 'var(--color-border)';
      }
    });
  });

  console.log('✅ JavaScript inicializado correctamente');
});

// Test de conectividad (opcional - para debugging)
function testConectividad() {
  console.log('🧪 Probando conectividad...');
  
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxFlzHwkWMzspVvmXcKrO0JlX4DqEKLvS9VK2EITsRQY7vl8i6W7EcDfwUxFNLQ1qxk/exec";
  
  fetch(SCRIPT_URL, {
    method: "GET"
  })
  .then(response => {
    console.log('✅ Conectividad OK:', response.status);
  })
  .catch(error => {
    console.error('❌ Error de conectividad:', error);
  });
}

// Ejecutar test de conectividad al cargar (descomenta si necesitas debugging)
// testConectividad();