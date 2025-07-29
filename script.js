const form = document.getElementById("registroForm");
const mensaje = document.getElementById("mensaje");
const loadingOverlay = document.getElementById("loading");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  mensaje.style.display = "none";
  loadingOverlay.style.display = "block";

  const datos = {
    nombre: form.nombre.value.trim(),
    apellido: form.apellido.value.trim(),
    email: form.email.value.trim(),
    telefono: form.telefono.value.trim(),
    iglesia: form.iglesia.value.trim()
  };

  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbzwUuMwbclV-JyF8W50fPICOmaBxVhutmpzzahq2Df9ydd5ZgyzsxZJGC1Hg0iLqiBn/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    if (res.ok) {
      mensaje.style.color = "green";
      mensaje.textContent = "¡Registro enviado con éxito!";
      form.reset();
    } else {
      throw new Error("Error en la solicitud");
    }
  } catch (error) {
    mensaje.style.color = "red";
    mensaje.textContent = "Error enviando los datos. Intente nuevamente.";
    console.error(error);
  } finally {
    loadingOverlay.style.display = "none";
    mensaje.style.display = "block";
  }
});
