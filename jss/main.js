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
window.toggleMenu = function() {
    const navLinks = document.querySelector(".nav-links");
    const hamburger = document.querySelector(".hamburger");
    if (navLinks) {
        const isOpen = navLinks.classList.toggle("show");
        if (hamburger) {
            hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
        }
    }
};

// 2. INICIALIZACIÓN DE EVENTOS
document.addEventListener('DOMContentLoaded', () => {

    // PESTAÑAS DE QUIÉNES SOMOS
    document.querySelectorAll('[data-tabs]').forEach(tabGroup => {
        const tabs = Array.from(tabGroup.querySelectorAll('[role="tab"]'));

        const activateTab = tab => {
            tabs.forEach(currentTab => {
                const isSelected = currentTab === tab;
                currentTab.setAttribute('aria-selected', String(isSelected));
                currentTab.tabIndex = isSelected ? 0 : -1;

                const panel = document.getElementById(currentTab.getAttribute('aria-controls'));
                if (panel) {
                    panel.hidden = !isSelected;
                }
            });
        };

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => activateTab(tab));
            tab.addEventListener('keydown', event => {
                let nextIndex;
                if (event.key === 'ArrowRight') {
                    nextIndex = (index + 1) % tabs.length;
                } else if (event.key === 'ArrowLeft') {
                    nextIndex = (index - 1 + tabs.length) % tabs.length;
                } else if (event.key === 'Home') {
                    nextIndex = 0;
                } else if (event.key === 'End') {
                    nextIndex = tabs.length - 1;
                } else {
                    return;
                }

                event.preventDefault();
                const nextTab = tabs[nextIndex];
                activateTab(nextTab);
                nextTab.focus();
            });
        });
    });

    // DETALLES DE LOS PLANES
    const planTriggers = document.querySelectorAll('[data-plan-trigger]');
    planTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const panelId = trigger.getAttribute('aria-controls');
            const panel = document.getElementById(panelId);
            const shouldOpen = trigger.getAttribute('aria-expanded') !== 'true';

            planTriggers.forEach(otherTrigger => {
                otherTrigger.setAttribute('aria-expanded', 'false');
                const otherPanel = document.getElementById(otherTrigger.getAttribute('aria-controls'));
                if (otherPanel) {
                    otherPanel.hidden = true;
                }
            });

            if (panel && shouldOpen) {
                trigger.setAttribute('aria-expanded', 'true');
                panel.hidden = false;
            }
        });
    });
    
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

    // --- EVENTO PARA EL MENÚ HAMBURGUESA ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    const closeMobileMenu = () => {
        if (navLinks && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            if (hamburger) {
                hamburger.setAttribute('aria-expanded', 'false');
            }
        }
    };

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => window.toggleMenu());
    }

    navItems.forEach(item => {
        item.addEventListener('click', closeMobileMenu);
    });

});