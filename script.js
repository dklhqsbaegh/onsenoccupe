/* On S'en Occupe — interactions minimales (vanilla, zéro dépendance) */

/* ============================================================
   CONFIG — à remplir par Hugo avant mise en ligne
   ============================================================ */
// URL du webhook Make (voir ESSAI-BACKEND.md). Laisser vide ("") pour le
// fallback mailto. Quand il est rempli, le formulaire affiche les 3 échanges
// générés directement sur la page (écran de chargement puis résultats).
const FORM_ENDPOINT = "";
// Lien de réservation d'appel (Cal.com / Calendly), affiché sous les
// résultats. Laisser vide ("") pour masquer le bouton.
const CALL_URL = "";
const CONTACT_EMAIL = "hugo@onsenoccupe.fr";
// Adresse où le prospect transfère ses emails clients
const ESSAI_EMAIL = "essai@onsenoccupe.fr";

// ── Places restantes (section Tarif) — calculées selon le jour du mois ──
// Jour 1 : 10 places. Puis descente régulière jusqu'à 1 place restante
// une semaine avant la fin du mois (et 1 jusqu'au dernier jour).
function placesRestantes() {
  const now = new Date();
  const jour = now.getDate();
  const joursDansLeMois = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const jourPlancher = joursDansLeMois - 7; // à partir d'ici : 1 place
  if (jour >= jourPlancher) return 1;
  const progression = (jour - 1) / (jourPlancher - 1); // 0 → 1
  return Math.max(1, Math.round(10 - 9 * progression));
}

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
   En scrollant : la question recule et s'estompe, la réponse vérifiée
   se redresse et vient au premier plan. Lissage à inertie (lerp). */
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
  const n = placesRestantes();
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

/* ---------- Essai gratuit : écran de chargement puis résultats sur la page ----------
   Actif seulement quand FORM_ENDPOINT est rempli. Le webhook répond en JSON :
   { "exchanges": [ { "from", "subject", "body", "reply_body" } ] }
   (contrat complet : ESSAI-BACKEND.md) */
const loadingEl = document.getElementById("essai-loading");
const resultsEl = document.getElementById("essai-results");

const showLoading = () => {
  if (!loadingEl) return () => {};
  loadingEl.textContent = "";
  const spin = document.createElement("div");
  spin.className = "load-spin";
  const steps = [
    "On lit votre boutique…",
    "On repère vos produits, vos délais, vos conditions de retour…",
    "Notre agent rédige les 3 échanges de votre boutique…",
  ].map((txt) => {
    const li = document.createElement("p");
    li.className = "load-step";
    li.textContent = txt;
    return li;
  });
  loadingEl.append(spin, ...steps);
  loadingEl.hidden = false;
  let i = 0;
  steps[0].classList.add("on");
  const timer = setInterval(() => {
    i = Math.min(i + 1, steps.length - 1);
    steps.forEach((s, k) => s.classList.toggle("on", k <= i));
  }, 8000);
  return () => {
    clearInterval(timer);
    loadingEl.hidden = true;
  };
};

const showResults = (data) => {
  if (!resultsEl || !data || !Array.isArray(data.exchanges) || !data.exchanges.length) return false;
  resultsEl.textContent = "";

  const title = document.createElement("h3");
  title.className = "results-title";
  title.textContent = "Voici ce que vos clients recevraient" + (data.prenom ? ", " + data.prenom : "") + ".";
  const sub = document.createElement("p");
  sub.className = "results-sub";
  sub.textContent =
    "Trois emails clients typiques de votre boutique — et la réponse que notre agent enverrait, " +
    "rédigée à partir des seules infos publiques de votre site. En production, il aurait en plus " +
    "le statut exact de chaque commande sous les yeux.";
  resultsEl.append(title, sub);

  data.exchanges.slice(0, 3).forEach((x) => {
    const ex = document.createElement("article");
    ex.className = "result-exchange";

    const mail = document.createElement("div");
    mail.className = "r-mail";
    const meta = document.createElement("p");
    meta.className = "r-meta";
    meta.textContent = (x.from || "Client") + (x.subject ? " — " + x.subject : "");
    const body = document.createElement("p");
    body.className = "r-body";
    body.textContent = x.body || "";
    mail.append(meta, body);

    const rep = document.createElement("div");
    rep.className = "r-reply";
    const badge = document.createElement("p");
    badge.className = "r-badge";
    badge.textContent = "Réponse de votre agent";
    const rbody = document.createElement("p");
    rbody.className = "r-body";
    rbody.textContent = x.reply_body || "";
    rep.append(badge, rbody);

    ex.append(mail, rep);
    resultsEl.append(ex);
  });

  const cta = document.createElement("div");
  cta.className = "results-cta";
  const hook = document.createElement("p");
  hook.className = "results-hook";
  hook.textContent = "Envie de voir ça tourner sur vos vrais emails, avec vos vraies commandes ?";
  cta.append(hook);
  if (CALL_URL) {
    const a = document.createElement("a");
    a.className = "btn btn-primary";
    a.href = CALL_URL;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Réserver un appel de 15 minutes";
    cta.append(a);
  }
  const alt = document.createElement("p");
  alt.className = "results-alt";
  alt.textContent =
    "Ou transférez 3 à 10 vrais emails clients à " + ESSAI_EMAIL +
    " — réponses rédigées par l'agent et vérifiées par un humain.";
  cta.append(alt);
  resultsEl.append(cta);

  resultsEl.hidden = false;
  resultsEl.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
  return true;
};

// Aperçu / débogage : window.__essaiDemo({prenom, exchanges:[…]}) dans la console
window.__essaiDemo = showResults;

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
      // Le formulaire s'efface, l'écran de chargement prend sa place, puis
      // les 3 échanges générés s'affichent directement sur la page.
      form.hidden = true;
      const stopLoading = showLoading();
      const ctrl = "AbortController" in window ? new AbortController() : null;
      const timeout = ctrl ? setTimeout(() => ctrl.abort(), 150000) : null;
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
          signal: ctrl ? ctrl.signal : undefined,
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json().catch(() => null);
        stopLoading();
        if (json && showResults({ ...json, prenom: data.prenom })) {
          form.reset();
        } else {
          // Lead bien reçu mais pas d'échanges renvoyés : confirmation classique
          form.hidden = false;
          form.reset();
          showConfirmation(data.prenom);
        }
      } catch (err) {
        stopLoading();
        form.hidden = false;
        setStatus("L'envoi a échoué. Réessayez, ou écrivez-nous : " + CONTACT_EMAIL, "err");
      } finally {
        if (timeout) clearTimeout(timeout);
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
