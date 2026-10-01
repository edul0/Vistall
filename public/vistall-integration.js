(function () {
  const originalSelectService = window.selectServiceOption;
  window.selectServiceOption = function (service) {
    originalSelectService(service);
    const website = document.getElementById("site_url");
    if (website) {
      website.required = service === "revisao";
      website.type = service === "revisao" ? "url" : "text";
      website.maxLength = 300;
    }
  };

  window.switchPreview = function (mode) {
    const original = document.getElementById("view-original");
    const refined = document.getElementById("view-refined");
    const originalButton = document.getElementById("toggle-original-btn");
    const refinedButton = document.getElementById("toggle-refined-btn");
    if (!original || !refined || !originalButton || !refinedButton) return;
    const isOriginal = mode === "original";
    original.classList.toggle("hidden", !isOriginal);
    original.classList.toggle("opacity-0", !isOriginal);
    refined.classList.toggle("hidden", isOriginal);
    refined.classList.toggle("opacity-0", isOriginal);
    originalButton.setAttribute("aria-selected", String(isOriginal));
    refinedButton.setAttribute("aria-selected", String(!isOriginal));
    const active = "px-space-md py-1 rounded bg-surface-container-lowest text-primary font-semibold shadow-sm transition-all duration-300 active:scale-95 text-sm";
    const inactive = "px-space-md py-1 rounded text-on-surface-variant hover:text-on-surface transition-all duration-300 active:scale-95 text-sm font-medium";
    originalButton.className = isOriginal ? active : inactive;
    refinedButton.className = isOriginal ? inactive : active;
  };

  window.handleFormSubmit = async function (event) {
    event.preventDefault();
    const form = document.getElementById("vistall-form");
    if (!form || !form.reportValidity()) return;
    const button = document.getElementById("submit-btn");
    const buttonText = document.getElementById("submit-text");
    const buttonIcon = document.getElementById("submit-icon");
    const feedback = document.getElementById("form-feedback");
    const service = document.getElementById("selected_service").value;
    const business = document.getElementById("business_name").value.trim();
    const website = document.getElementById("site_url").value.trim();
    const notes = document.getElementById("project_notes").value.trim();
    const email = document.getElementById("client_email").value.trim();
    if (!button || !buttonText || !feedback) return;

    button.disabled = true;
    buttonText.textContent = "Enviando...";
    if (buttonIcon) buttonIcon.textContent = "hourglass_top";
    feedback.classList.add("hidden");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ service, business, website, notes, email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar agora.");

      feedback.replaceChildren();
      const message = document.createElement("span");
      message.textContent = service === "revisao"
        ? "Pedido recebido. Para confirmar a revisão de R$ 250, pague pelo Mercado Pago. No checkout, confira o nome cadastrado da conta de pagamento antes de concluir."
        : "Pedido recebido. Responderemos pelo e-mail informado com uma proposta de escopo e valor; ainda não há cobrança.";
      feedback.append(message);
      if (service === "revisao") {
        const payment = document.createElement("a");
        payment.href = "https://mpago.la/26Q1m2a";
        payment.target = "_blank";
        payment.rel = "noopener noreferrer";
        payment.textContent = "Abrir pagamento ↗";
        payment.style.cssText = "display:block;font-weight:700;text-decoration:underline;margin-top:12px";
        feedback.append(payment);
      }
      feedback.classList.remove("hidden");
      feedback.setAttribute("role", "status");
      form.reset();
      window.selectServiceOption("revisao");
      buttonText.textContent = "Solicitação registrada";
      if (buttonIcon) buttonIcon.textContent = "check";
    } catch (error) {
      feedback.replaceChildren();
      const message = document.createElement("span");
      message.textContent = error instanceof Error ? error.message : "Tente novamente em alguns minutos.";
      feedback.append(message);
      feedback.classList.remove("hidden");
      feedback.setAttribute("role", "alert");
      buttonText.textContent = "Tentar enviar novamente";
      if (buttonIcon) buttonIcon.textContent = "north_east";
      button.disabled = false;
    }
  };

  const notes = document.getElementById("project_notes");
  if (notes) notes.maxLength = 3000;
  const business = document.getElementById("business_name");
  if (business) business.maxLength = 100;
  const email = document.getElementById("client_email");
  if (email) email.maxLength = 200;
  window.selectServiceOption("revisao");
})();
