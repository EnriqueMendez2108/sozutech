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
                if (i.type !== 'hidden') {
                    i.value = "";
                    i.setAttribute('value', '');
                }
            });
            if (f.id === 'form-cotizacion') {
                f.hidden = false;
            }
        });

        const quoteSuccess = m.querySelector('#quote-success');
        if (quoteSuccess) {
            quoteSuccess.hidden = true;
        }
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
                        message.hidden = false;
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
    const quoteSuccess = document.getElementById("quote-success");
    const promoCode = document.getElementById("codigo-descuento");
    const planSelection = document.getElementById("plan-selection");
    const validPromoCodes = new Set(["BIENVENIDO10", "PRIMERAMOVIL"]);

    if (planSelection) {
        const mobilePlanSelection = window.matchMedia('(max-width: 768px)');
        const updatePlanSelectionMode = event => {
            const isMobile = event.matches;

            if (isMobile && planSelection.multiple) {
                const selectedPlan = planSelection.selectedOptions[0]?.value;
                planSelection.multiple = false;
                if (selectedPlan) {
                    planSelection.value = selectedPlan;
                }
            } else if (!isMobile) {
                planSelection.multiple = true;
            }
        };

        updatePlanSelectionMode(mobilePlanSelection);
        if (mobilePlanSelection.addEventListener) {
            mobilePlanSelection.addEventListener('change', updatePlanSelectionMode);
        } else {
            mobilePlanSelection.addListener(updatePlanSelectionMode);
        }
    }

    if (promoCode) {
        promoCode.addEventListener('input', () => {
            const code = promoCode.value.trim().toUpperCase();
            const isValid = code === '' || validPromoCodes.has(code);
            promoCode.setCustomValidity(isValid ? '' : 'Código no reconocido. Usa BIENVENIDO10 o PRIMERAMOVIL, o deja el campo vacío para aplicar la oferta automáticamente.');
        });
    }

    if (modalForm) {
        modalForm.addEventListener("submit", async function(e) {
            e.preventDefault();

            try {
                const formData = new FormData(modalForm);
                if (promoCode) {
                    formData.set('codigo_descuento', promoCode.value.trim().toUpperCase());
                }

                const response = await fetch(modalForm.action, {
                    method: modalForm.method,
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    if (quoteSuccess) {
                        modalForm.hidden = true;
                        quoteSuccess.hidden = false;
                        quoteSuccess.focus();
                    }
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