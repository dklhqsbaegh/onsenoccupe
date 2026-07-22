/* On S'en Occupe — interactions minimales (vanilla, zéro dépendance) */

/* ============================================================
   CONFIG — à remplir par Hugo avant mise en ligne
   ============================================================ */
// URL Tally / Formspark / webhook. Laisser vide ("") pour le fallback mailto.
const FORM_ENDPOINT = "";
// Lien Cal.com (ex : "https://cal.com/hugo-onsenoccupe/15min"). Vide = lien inactif.
const CALCOM_URL = "";
const CONTACT_EMAIL = "hugo@onsenoccupe.fr";

/* ---------- Header : bordure au scroll (sentinelle, pas d'écouteur scroll) ---------- */
const header = document.querySelector(".site-header");
const sentinel = document.getElementById("header-sentinel");
if (header && sentinel && "IntersectionObserver" in window) {
  new IntersectionObserver(
    ([entry]) => header.classList.toggle("is-stuck", !entry.isIntersecting),
    { rootMargin: "0px" }
  ).observe(sentinel);
}

/* ---------- Reveal on scroll (désactivé si prefers-reduced-motion) ---------- */
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealEls = document.querySelectorAll(".reveal");
if (!prefersReduced && "IntersectionObserver" in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.18 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

/* ---------- Effet scroll du hero : « la réponse prend le dessus » ----------
   Uniquement le titre de scène et les 2 cartes (tout ce qui est au-dessus
   de la ligne bénéfice). En scrollant : la question recule et s'estompe,
   la réponse vérifiée se redresse et vient au premier plan.
   Lissage à inertie (lerp) pour un mouvement fluide, transforms GPU only. */
(() => {
  if (prefersReduced) return;
  const title = document.querySelector(".scene-title");
  const cardL = document.querySelector(".tilt-l");
  const cardR = document.querySelector(".tilt-r");
  if (!cardL || !cardR) return;

  const RANGE = 520;                          // pixels de scroll pour l'effet complet
  const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
  let target = 0;
  let current = 0;
  let rafId = null;

  const render = () => {
    current += (target - current) * 0.14;     // inertie douce
    if (Math.abs(target - current) < 0.001) current = target;
    const p = ease(current);

    if (title) {
      title.style.transform = `translate3d(0, ${(-10 * p).toFixed(1)}px, 0)`;
      title.style.opacity = (1 - 0.35 * p).toFixed(3);
    }
    // La question recule : monte, s'incline, rétrécit, s'estompe
    cardL.style.transform =
      `translate3d(0, ${(-54 * p).toFixed(1)}px, 0) rotate(${(-2 - 2.8 * p).toFixed(2)}deg) scale(${(1 - 0.06 * p).toFixed(3)})`;
    cardL.style.opacity = (1 - 0.55 * p).toFixed(3);
    // La réponse prend le dessus : se redresse et grossit légèrement
    cardR.style.transform =
      `translate3d(0, ${(-12 * p).toFixed(1)}px, 0) rotate(${(1.4 - 1.4 * p).toFixed(2)}deg) scale(${(1 + 0.055 * p).toFixed(3)})`;

    rafId = current === target ? null : requestAnimationFrame(render);
  };

  const onScroll = () => {
    target = Math.min(Math.max(window.scrollY / RANGE, 0), 1);
    if (rafId === null) rafId = requestAnimationFrame(render);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ---------- Lien Cal.com (chargé au clic uniquement — perf, brief §6) ---------- */
const calLink = document.querySelector("[data-calcom]");
if (calLink) {
  calLink.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (CALCOM_URL) {
      window.open(CALCOM_URL, "_blank", "noopener");
    } else {
      alert("Le lien de réservation sera bientôt disponible. Écrivez-nous : " + CONTACT_EMAIL);
    }
  });
}

/* ---------- Formulaire audit : validation + POST ou fallback mailto ---------- */
const form = document.getElementById("audit-form");
if (form) {
  const statusEl = form.querySelector(".form-status");

  const setStatus = (msg, kind) => {
    statusEl.textContent = msg;
    statusEl.className = "form-status " + kind;
  };

  const validate = () => {
    let ok = true;
    form.querySelectorAll(".field:not(.hp)").forEach((field) => {
      const input = field.querySelector("input, select");
      if (!input || !input.required) return;
      const valid =
        input.type === "email"
          ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())
          : input.value.trim().length > 0;
      field.classList.toggle("invalid", !valid);
      if (!valid) ok = false;
    });
    return ok;
  };

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    // Honeypot : si rempli, on ignore silencieusement (bot)
    if (form.querySelector('[name="website"]').value) return;

    if (!validate()) {
      setStatus("Vérifiez les champs en rouge.", "err");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    delete data.website;

    if (FORM_ENDPOINT) {
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = "Envoi en cours…";
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        setStatus("C'est noté ! Vous recevrez votre audit sous 48 h — surveillez votre boîte mail.", "ok");
      } catch (err) {
        setStatus("L'envoi a échoué. Réessayez, ou écrivez-nous : " + CONTACT_EMAIL, "err");
      } finally {
        btn.disabled = false;
        btn.textContent = "Recevoir mon audit offert";
      }
    } else {
      // Fallback mailto : ouvre l'email pré-rempli du visiteur
      const body = [
        "Bonjour Hugo,",
        "",
        "Je souhaite recevoir l'audit SAV offert.",
        "",
        "Prénom : " + data.prenom,
        "Email : " + data.email,
        "Boutique : " + data.boutique,
        "Commandes/mois : " + data.volume,
      ].join("\n");
      window.location.href =
        "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent("Demande d'audit SAV offert") +
        "&body=" + encodeURIComponent(body);
      setStatus("Votre logiciel d'email s'ouvre avec la demande pré-remplie — il ne reste qu'à envoyer.", "ok");
    }
  });
}
