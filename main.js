// 1. FUNCIONES DE CONTROL
window.openModal = function(id) {
    const m = document.getElementById(id);
    if (m) {
        m.style.display = "block";
        document.body.style.overflow = "hidden";
        
        // --- LA CLAVE PARA QUE FUNCIONE ESC ---
        m.setAttribute('tabindex', '-1'); 
        m.focus(); 
    }
};

window.closeModal = function(id) {
    const m = document.getElementById(id);
    if (m) {
        m.style.display = "none";
        document.body.style.overflow = "auto";

        // Limpieza de formularios dentro del modal
        const forms = m.querySelectorAll('form');
        forms.forEach(f => {
            f.reset();
            const inputs = f.querySelectorAll('input, textarea, select');
            inputs.forEach(i => {
                i.value = "";
                i.setAttribute('value', '');
            });
        });
    }
};

// ⚡ FUNCIÓN DEL MENÚ HAMBURGUESA
function toggleMenu() {
    const navLinks = document.querySelector(".nav-links");
    if (navLinks) {
        navLinks.classList.toggle("show");
    }
}

// 2. INICIALIZACIÓN DE EVENTOS
document.addEventListener('DOMContentLoaded', () => {
    
    // SLIDESHOW
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // CLIC FUERA DEL MODAL
    window.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // --- LÓGICA ESCAPE ---
    document.addEventListener('keydown', function(e) {
        if (e.key === "Escape" || e.keyCode === 27) {
            const modales = document.querySelectorAll('.modal');
            modales.forEach(modal => {
                if (window.getComputedStyle(modal).display !== 'none') {
                    closeModal(modal.id);
                }
            });
        }
    }, true); 

    // FORMULARIO DE CONTACTO PRINCIPAL
    const form = document.getElementById("contactForm");
    const message = document.getElementById("formMessage");

    if (form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    form.reset();

                    // Limpieza manual de campos
                    const inputs = form.querySelectorAll("input, textarea");
                    inputs.forEach(i => {
                        i.value = "";
                        i.setAttribute("value", "");
                    });

                    if (message) {
                        message.style.display = "block";
                    }
                } else {
                    alert("Hubo un problema al enviar el formulario.");
                }
            } catch (error) {
                alert("Error de conexión. Intenta de nuevo.");
            }
        });
    }

    // FORMULARIO DEL MODAL DE COTIZACIÓN
    const modalForm = document.getElementById("form-cotizacion");
    const modalMessage = document.getElementById("modalMessage");

    if (modalForm) {
        modalForm.addEventListener("submit", async function(e) {
            e.preventDefault();

            try {
                const response = await fetch(modalForm.action, {
                    method: modalForm.method,
                    body: new FormData(modalForm),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    modalForm.reset();

                    // Limpieza manual de campos
                    const inputs = modalForm.querySelectorAll("input, textarea");
                    inputs.forEach(i => {
                        i.value = "";
                        i.setAttribute("value", "");
                    });

                    if (modalMessage) {
                        modalMessage.style.display = "block";
                    }
                    closeModal('modal-cotizacion'); // opcional: cerrar modal tras enviar
                } else {
                    alert("Hubo un problema al enviar la cotización.");
                }
            } catch (error) {
                alert("Error de conexión. Intenta de nuevo.");
            }
        });
    }
});
