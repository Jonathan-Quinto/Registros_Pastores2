const form = document.getElementById("registroForm");
const mensaje = document.getElementById("mensaje");
const loadingOverlay = document.getElementById("loading");

// URL de tu Google Apps Script Web App
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxFlzHwkWMzspVvmXcKrO0JlX4DqEKLvS9VK2EITsRQY7vl8i6W7EcDfwUxFNLQ1qxk/exec";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Ocultar mensaje anterior y mostrar loading
  mensaje.style.display = "none";
  loadingOverlay.style.display = "block";

  // Recopilar datos del formulario
  const datos = {
    nombre: form.nombre.value.trim(),
    apellido: form.apellido.value.trim(),
    email: form.email.value.trim(),
    telefono: form.telefono.value.trim(),
    iglesia: form.iglesia.value.trim()
  };

  console.log('Enviando datos:', datos);

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    // Intentar parsear la respuesta
    const result = await response.text();
    console.log('Response text:', result);

    let jsonResult;
    try {
      jsonResult = JSON.parse(result);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw new Error('Respuesta inválida del servidor');
    }

    if (jsonResult.result === "success") {
      mostrarMensaje("¡Registro enviado con éxito! Gracias por confirmar tu asistencia.", "success");
      form.reset();
    } else {
      throw new Error(jsonResult.message || "Error desconocido en el servidor");
    }

  } catch (error) {
    console.error('Error completo:', error);
    mostrarMensaje(`Error enviando los datos: ${error.message}. Intente nuevamente.`, "error");
  } finally {
    loadingOverlay.style.display = "none";
  }
});

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
  mensaje.style.display = "block";
  
  // Auto-ocultar después de 5 segundos si es éxito
  if (tipo === "success") {
    setTimeout(() => {
      mensaje.style.display = "none";
    }, 5000);
  }
}