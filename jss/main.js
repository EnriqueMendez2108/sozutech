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
    const serviceOptions = Array.from(document.querySelectorAll('input[name="servicios[]"]'));
    const validPromoCodes = new Set(["BIENVENIDO10", "PRIMERAMOVIL"]);

    if (serviceOptions.length) {
        const updateServiceSelectionValidity = () => {
            const hasSelection = serviceOptions.some(option => option.checked);
            serviceOptions[0].setCustomValidity(
                hasSelection ? "" : "Selecciona al menos un servicio de interés."
            );
        };

        serviceOptions.forEach(option => {
            option.addEventListener("change", updateServiceSelectionValidity);
        });
        updateServiceSelectionValidity();
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

    // ASISTENTE VIRTUAL Y CAPTURA DE SOLICITUDES
    const assistantToggle = document.getElementById("assistant-toggle");
    const assistantClose = document.getElementById("assistant-close");
    const assistantPanel = document.getElementById("assistant-panel");
    const assistantMessages = document.getElementById("assistant-messages");
    const assistantChatForm = document.getElementById("assistant-chat-form");
    const assistantQuestion = document.getElementById("assistant-question");
    const assistantLeadForm = document.getElementById("assistant-lead-form");
    const assistantLeadClose = document.getElementById("assistant-lead-close");
    const assistantLeadStatus = document.getElementById("assistant-form-status");
    const assistantSubmit = assistantLeadForm?.querySelector('button[type="submit"]');
    const assistantPhone = document.getElementById("assistant-phone");
    const assistantInitialMessages = assistantMessages?.cloneNode(true);
    let assistantSessionId = 0;

    const addAssistantMessage = (text, sender = "bot") => {
        if (!assistantMessages) return;

        const message = document.createElement("p");
        message.className = `assistant-message assistant-message--${sender}`;
        message.textContent = text;
        assistantMessages.append(message);
        assistantMessages.scrollTop = assistantMessages.scrollHeight;
    };

    const addAssistantLink = (text, label, href) => {
        if (!assistantMessages) return;

        const message = document.createElement("p");
        message.className = "assistant-message assistant-message--bot";
        message.append(document.createTextNode(`${text} `));
        const link = document.createElement("a");
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = label;
        message.append(link);
        assistantMessages.append(message);
        assistantMessages.scrollTop = assistantMessages.scrollHeight;
    };

    const resetAssistant = () => {
        assistantSessionId += 1;
        if (assistantMessages && assistantInitialMessages) {
            assistantMessages.replaceChildren(...Array.from(assistantInitialMessages.childNodes, node => node.cloneNode(true)));
            assistantMessages.scrollTop = 0;
        }
        assistantChatForm?.reset();
        assistantLeadForm?.reset();
        if (assistantLeadForm) assistantLeadForm.hidden = true;
        assistantPanel?.classList.remove("assistant-panel--lead-open");
        if (assistantLeadStatus) assistantLeadStatus.textContent = "";
        if (assistantSubmit) {
            assistantSubmit.disabled = false;
            assistantSubmit.textContent = "Enviar solicitud";
        }
    };

    const setAssistantOpen = isOpen => {
        if (!assistantPanel || !assistantToggle) return;

        if (!isOpen) resetAssistant();
        assistantPanel.hidden = !isOpen;
        assistantPanel.setAttribute("aria-hidden", String(!isOpen));
        assistantToggle.setAttribute("aria-expanded", String(isOpen));
        assistantToggle.setAttribute("aria-label", isOpen ? "Cerrar asistente de Sozutech" : "Abrir asistente de Sozutech");
        if (isOpen) {
            assistantQuestion?.focus();
        } else {
            assistantToggle.focus();
        }
    };

    const showAssistantLeadForm = details => {
        if (!assistantLeadForm) return;

        assistantLeadForm.hidden = false;
        assistantPanel?.classList.add("assistant-panel--lead-open");
        assistantLeadStatus.textContent = "";
        const assistantDetails = document.getElementById("assistant-details");
        if (details && assistantDetails && !assistantDetails.value.trim()) {
            assistantDetails.value = details;
        }
        document.getElementById("assistant-name")?.focus();
    };

    const handleAssistantAction = action => {
        if (action === "services") {
            addAssistantMessage("Ofrecemos desarrollo web y de software, soporte técnico, redes e infraestructura y venta de equipos de cómputo en CDMX y zona metropolitana.");
        } else if (action === "quote") {
            addAssistantMessage("Con gusto. Completa estos datos y enviaremos tu solicitud al equipo de Sozutech.");
            showAssistantLeadForm();
        } else if (action === "whatsapp") {
            addAssistantLink("También puedes escribirnos directamente por", "WhatsApp", "https://wa.me/525521080388?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20los%20servicios%20de%20Sozutech.");
        }
    };

    if (assistantToggle && assistantPanel) {
        assistantToggle.addEventListener("click", () => {
            setAssistantOpen(assistantToggle.getAttribute("aria-expanded") !== "true");
        });
    }

    assistantClose?.addEventListener("click", () => setAssistantOpen(false));

    assistantLeadClose?.addEventListener("click", () => {
        if (!assistantLeadForm || assistantSubmit?.disabled) return;

        assistantLeadForm.hidden = true;
        assistantPanel?.classList.remove("assistant-panel--lead-open");
        assistantQuestion?.focus();
    });

    assistantChatForm?.addEventListener("submit", event => {
        event.preventDefault();
        const question = assistantQuestion?.value.trim();
        if (!question || !assistantQuestion) return;

        addAssistantMessage(question, "user");
        assistantQuestion.value = "";
        const normalizedQuestion = question.toLocaleLowerCase("es-MX")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        const hasEmailAddress = /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(question);
        const hasPhoneNumber = normalizedQuestion.replace(/\D/g, "").length >= 10;
        const mentionsContactDetails = /\b(mi nombre es|me llamo|mi correo|mi email|mi telefono|mis datos)\b/.test(normalizedQuestion);

        if (hasEmailAddress || hasPhoneNumber || mentionsContactDetails) {
            addAssistantMessage("Veo que compartiste datos de contacto. Por seguridad, el chat no los envía al equipo. Completa y envía el formulario para que un agente de Sozutech pueda comunicarse contigo.");
            showAssistantLeadForm();
        } else if (/\b(cotiz|presupuesto|precio|precios|costo|costos|cuesta|cuestan|tarifa|tarifas|cuanto|contrat|propuesta)\w*\b/.test(normalizedQuestion)) {
            addAssistantMessage("Preparamos cotizaciones personalizadas sin costo. Déjanos tus datos y una breve descripción para que el equipo te contacte.");
            showAssistantLeadForm(question);
        } else if (/\b(servicio|servicios|hacen|ofrecen|oferta)\w*\b/.test(normalizedQuestion)) {
            handleAssistantAction("services");
        } else if (/\b(problema|problemas|fall[oa]s?|errores?|no funciona|no me funciona|no sirve|necesito ayuda|ayuda con)\b/.test(normalizedQuestion)) {
            addAssistantMessage("Lamento que tengas ese problema. Para que un agente pueda ayudarte, deja tus datos y cuéntanos qué sucede en el formulario. Tu mensaje ya quedó agregado para que no tengas que escribirlo de nuevo.");
            showAssistantLeadForm(question);
        } else if (/\b(soporte|repar|mantenimiento|computadora|computadoras|equipo)\w*\b/.test(normalizedQuestion)) {
            addAssistantMessage("Brindamos soporte técnico, mantenimiento preventivo y correctivo, reparación de equipos y asesoría de hardware en Ciudad de México.");
        } else if (/\b(red|redes|wifi|wi-fi|cableado|infraestructura)\w*\b/.test(normalizedQuestion)) {
            addAssistantMessage("Instalamos y configuramos redes empresariales, Wi-Fi y cableado estructurado. Si nos compartes los detalles, podemos preparar una cotización.");
        } else if (/\b(web|sitio|pagina|página|software|tienda|aplicacion|aplicación)\w*\b/.test(normalizedQuestion)) {
            addAssistantMessage("Desarrollamos sitios web, tiendas en línea, landing pages y soluciones de software a medida. Cuéntanos tu idea para orientarte.");
        } else if (/\b(ubicacion|ubicación|zona|donde|dónde|cobertura|ciudad|cdmx)\w*\b/.test(normalizedQuestion)) {
            addAssistantMessage("Atendemos Ciudad de México y la Zona Metropolitana. Cuéntanos en qué zona necesitas el servicio para confirmar la cobertura.");
        } else if (/\b(horario|horarios|abren|abierto|atienden)\w*\b/.test(normalizedQuestion)) {
            addAssistantMessage("Para confirmar disponibilidad y horario de atención, escríbenos por WhatsApp o deja tus datos en el formulario de contacto.");
            handleAssistantAction("whatsapp");
        } else if (/\b(persona|asesor|humano|whatsapp|contacto|contactar|hablar)\w*\b/.test(normalizedQuestion)) {
            addAssistantMessage("Claro, puedes solicitar que te contactemos o escribirnos directamente por WhatsApp.");
            showAssistantLeadForm();
            handleAssistantAction("whatsapp");
        } else if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches)\b/.test(normalizedQuestion)) {
            addAssistantMessage("¡Hola! Puedo contarte sobre nuestros servicios, cobertura o ayudarte a solicitar una cotización gratuita.");
        } else {
            addAssistantMessage("No tengo suficiente información para resolverlo desde el chat. Deja tus datos y una breve descripción en el formulario; un agente de Sozutech podrá revisar tu caso y comunicarse contigo.");
            showAssistantLeadForm(question);
        }
    });

    assistantMessages?.addEventListener("click", event => {
        if (!(event.target instanceof Element)) return;
        const button = event.target.closest("[data-assistant-action]");
        if (button && assistantMessages.contains(button)) {
            handleAssistantAction(button.getAttribute("data-assistant-action"));
        }
    });

    assistantPhone?.addEventListener("input", () => {
        assistantPhone.value = assistantPhone.value.replace(/\D/g, "").slice(0, 10);
    });

    assistantLeadForm?.addEventListener("submit", async event => {
        event.preventDefault();
        if (!assistantLeadForm.reportValidity() || !assistantSubmit || !assistantLeadStatus) return;

        const submissionSessionId = assistantSessionId;
        assistantSubmit.disabled = true;
        assistantSubmit.textContent = "Enviando...";
        assistantLeadStatus.textContent = "";

        try {
            const response = await fetch(assistantLeadForm.action, {
                method: assistantLeadForm.method,
                body: new FormData(assistantLeadForm),
                headers: { Accept: "application/json" }
            });

            if (!response.ok) {
                throw new Error(`El servicio de solicitudes respondió con estado ${response.status}.`);
            }

            if (submissionSessionId !== assistantSessionId) return;
            const contactName = document.getElementById("assistant-name").value.trim();
            assistantLeadForm.reset();
            assistantLeadForm.hidden = true;
            assistantPanel?.classList.remove("assistant-panel--lead-open");
            addAssistantMessage(`¡Gracias${contactName ? `, ${contactName}` : ""}! Tu solicitud se envió correctamente. Un agente de Sozutech se comunicará contigo al correo o teléfono que proporcionaste para dar seguimiento.`);
        } catch (error) {
            console.error("No se pudo enviar la solicitud del asistente:", error);
            if (submissionSessionId === assistantSessionId) {
                assistantLeadStatus.textContent = "No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo o contáctanos por WhatsApp.";
            }
        } finally {
            if (submissionSessionId === assistantSessionId) {
                assistantSubmit.disabled = false;
                assistantSubmit.textContent = "Enviar solicitud";
            }
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && assistantPanel && !assistantPanel.hidden) {
            setAssistantOpen(false);
            assistantToggle?.focus();
        }
    });

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