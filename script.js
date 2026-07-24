/* On S'en Occupe — interactions minimales (vanilla, zéro dépendance) */

/* ============================================================
   CONFIG — à remplir par Hugo avant mise en ligne
   ============================================================ */
// URL Tally / Formspark / webhook. Laisser vide ("") pour le fallback mailto.
const FORM_ENDPOINT = "";
const CONTACT_EMAIL = "hugo@onsenoccupe.fr";
// Adresse où le prospect transfère ses emails clients
const ESSAI_EMAIL = "essai@onsenoccupe.fr";

// ── Places restantes (section Tarif) — ÉDITÉ À LA MAIN par Hugo ──
// Mettre 10 au début de chaque mois, puis baisser au fil des
// inscriptions réelles, jusqu'à 1 environ 5 jours avant la fin du mois.
// Le chiffre affiché doit toujours refléter la réalité.
const PLACES_RESTANTES = 10;

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
   Desktop uniquement (≥ 900px) : sur mobile les cartes sont empilées,
   l'effet gêne la lecture au lieu de la servir.
   En scrollant : la question recule et s'estompe, la réponse vérifiée
   se redresse et vient au premier plan. Lissage à inertie (lerp). */
(() => {
  if (prefersReduced) return;
  if (!window.matchMedia("(min-width: 900px)").matches) return;
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

/* ---------- Mois courant (rareté tarif) : se met à jour tout seul ---------- */
const moisEls = document.querySelectorAll(".js-mois");
if (moisEls.length) {
  try {
    const mois = new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(new Date());
    moisEls.forEach((el) => (el.textContent = mois));
  } catch (e) {
    /* le texte de repli « ce mois-ci » reste affiché */
  }
}

/* ---------- Places restantes : rendu du chiffre édité à la main ---------- */
const placesEls = document.querySelectorAll(".js-places");
if (placesEls.length) {
  const n = Math.max(1, Math.round(PLACES_RESTANTES));
  const texte = n === 1 ? "1 place restante" : n + " places restantes";
  placesEls.forEach((el) => (el.textContent = texte));
}

/* ---------- Rail d'échanges : flèches + points de position ---------- */
const rail = document.querySelector(".exchange-rail");
if (rail) {
  const btns = document.querySelectorAll(".rail-btn");
  const cartes = rail.querySelectorAll(".exchange-card");
  const dotsWrap = document.querySelector(".rail-dots");
  const pas = () => {
    const carte = rail.querySelector(".exchange-card");
    if (!carte) return rail.clientWidth * 0.8;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 16;
    return carte.getBoundingClientRect().width + gap;
  };
  let dots = [];
  if (dotsWrap && cartes.length) {
    cartes.forEach(() => {
      const d = document.createElement("span");
      d.className = "dot";
      dotsWrap.appendChild(d);
    });
    dots = Array.from(dotsWrap.children);
  }
  const majEtat = () => {
    const max = rail.scrollWidth - rail.clientWidth - 2;
    btns.forEach((b) => {
      const dir = Number(b.dataset.dir);
      b.disabled = dir < 0 ? rail.scrollLeft <= 2 : rail.scrollLeft >= max;
    });
    if (dots.length) {
      const idx = Math.min(dots.length - 1, Math.round(rail.scrollLeft / pas()));
      dots.forEach((d, i) => d.classList.toggle("on", i === idx));
    }
  };
  btns.forEach((b) =>
    b.addEventListener("click", () => {
      rail.scrollBy({ left: Number(b.dataset.dir) * pas(), behavior: prefersReduced ? "auto" : "smooth" });
    })
  );
  rail.addEventListener("scroll", majEtat, { passive: true });
  majEtat();
}

/* ---------- CTA collant mobile : après le hero, caché sur la section essai ---------- */
(() => {
  const bar = document.getElementById("sticky-cta");
  const hero = document.querySelector(".hero");
  const essai = document.getElementById("essai");
  if (!bar || !hero || !("IntersectionObserver" in window)) return;
  let heroVisible = true;
  let essaiVisible = false;
  const maj = () => {
    bar.hidden = heroVisible || essaiVisible;
  };
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; maj(); }).observe(hero);
  if (essai) new IntersectionObserver(([e]) => { essaiVisible = e.isIntersecting; maj(); }).observe(essai);
})();

/* ---------- Formulaire essai gratuit : validation + POST ou fallback mailto ---------- */
const form = document.getElementById("essai-form");
if (form) {
  const statusEl = form.querySelector(".form-status");

  const setStatus = (msg, kind) => {
    statusEl.textContent = msg;
    statusEl.className = "form-status " + kind;
  };

  /* Confirmation riche : consigne + boutons copier / ouvrir mail */
  const showConfirmation = (prenom) => {
    statusEl.textContent = "";
    statusEl.className = "form-status ok";

    const titre = document.createElement("p");
    titre.className = "confirm-title";
    titre.textContent = "C'est noté" + (prenom ? ", " + prenom : "") + " !";

    const consigne = document.createElement("p");
    consigne.textContent =
      "Dernière étape (2 minutes) : transférez 3 à 10 emails clients récents à " +
      ESSAI_EMAIL + ". Vos réponses partent instantanément.";

    const actions = document.createElement("div");
    actions.className = "confirm-actions";

    const btnCopy = document.createElement("button");
    btnCopy.type = "button";
    btnCopy.className = "btn btn-ghost";
    btnCopy.textContent = "Copier l'adresse";
    btnCopy.addEventListener("click", () => {
      const done = () => {
        btnCopy.textContent = "Adresse copiée ✓";
        setTimeout(() => (btnCopy.textContent = "Copier l'adresse"), 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ESSAI_EMAIL).then(done, done);
      } else {
        done();
      }
    });

    const btnMail = document.createElement("a");
    btnMail.className = "btn btn-primary";
    btnMail.href =
      "mailto:" + ESSAI_EMAIL +
      "?subject=" + encodeURIComponent("Essai gratuit — mes emails clients");
    btnMail.textContent = "Ouvrir mon mail";

    actions.append(btnCopy, btnMail);
    statusEl.append(titre, consigne, actions);
    statusEl.focus?.();
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
      input.setAttribute("aria-invalid", valid ? "false" : "true");
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
        showConfirmation(data.prenom);
      } catch (err) {
        setStatus("L'envoi a échoué. Réessayez, ou écrivez-nous : " + CONTACT_EMAIL, "err");
      } finally {
        btn.disabled = false;
        btn.textContent = "Essayer sur mes emails";
      }
    } else {
      // Fallback mailto : ouvre l'email pré-rempli du visiteur
      const body = [
        "Bonjour,",
        "",
        "Je souhaite tester l'agent sur mes emails clients.",
        "",
        "Prénom : " + data.prenom,
        "Email : " + data.email,
        "Boutique : " + data.boutique,
        data.emails ? "\nEmails clients :\n" + data.emails : "",
        "",
        "(Je transfère 3 à 10 emails clients récents à la suite de ce message.)",
      ].join("\n");
      window.location.href =
        "mailto:" + ESSAI_EMAIL +
        "?subject=" + encodeURIComponent("Essai gratuit — mes emails clients") +
        "&body=" + encodeURIComponent(body);
      showConfirmation(data.prenom);
    }
  });
}
