/* On S'en Occupe — interactions minimales (vanilla, zéro dépendance) */

/* ============================================================
   CONFIG — à remplir par Hugo avant mise en ligne
   ============================================================ */
// URL du webhook Make (voir ESSAI-BACKEND.md). Laisser vide ("") pour le
// fallback mailto. Quand il est rempli, le formulaire affiche les 3 échanges
// générés directement sur la page (écran de chargement puis résultats).
const FORM_ENDPOINT = "https://hook.eu1.make.com/952lnbliumihchddjq7rk3fu2viwfoop";
// Lien Calendly (ex. "https://calendly.com/onsenoccupe/15min"), intégré
// directement sous les résultats. Laisser vide ("") pour afficher le
// placeholder jaune en attendant.
const CALL_URL = "https://calendly.com/onsenoccupe/15min";
const CONTACT_EMAIL = "hugo@onsenoccupe.net";
// Adresse où le prospect transfère ses emails clients
const ESSAI_EMAIL = "essai@onsenoccupe.net";

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

  // Mobile : l'effet ne démarre que lorsque le bas de l'écran atteint la
  // fin du hero (la carte reste lisible tant qu'on est dessus, l'animation
  // accompagne la sortie). Desktop : inchangé, dès le début du scroll.
  const mobile = window.matchMedia("(max-width: 899px)").matches;
  const RANGE = mobile ? 340 : 520;           // pixels de scroll pour l'effet complet
  let startY = 0;
  if (mobile) {
    const proof = document.querySelector(".proof");
    if (proof) {
      startY = Math.max(0, proof.getBoundingClientRect().top + window.scrollY - window.innerHeight);
    } else {
      const r = cardL.getBoundingClientRect();
      startY = Math.max(0, r.top + window.scrollY - 96);
    }
  }
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
    target = Math.min(Math.max((window.scrollY - startY) / RANGE, 0), 1);
    if (rafId === null) rafId = requestAnimationFrame(render);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ---------- Valeurs dynamiques (source unique) : mois + places ----------
   Injectées dans tous les [data-dyn] : mois-courant, mois-dernier
   (janvier → « décembre » de l'année précédente), places, places-court. */
function moisFr(offset, base) {
  const d = base || new Date();
  const m = new Date(d.getFullYear(), d.getMonth() + offset, 1);
  try {
    return new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(m);
  } catch (e) {
    return null;
  }
}
(() => {
  const n = placesRestantes();
  const valeurs = {
    "mois-courant": moisFr(0),
    "mois-dernier": moisFr(-1),
    "places": n === 1 ? "1 place restante" : n + " places restantes",
    "places-court": n === 1 ? "1 place" : n + " places",
  };
  document.querySelectorAll("[data-dyn]").forEach((el) => {
    const v = valeurs[el.dataset.dyn];
    if (v) el.textContent = v;
  });
})();
// Vérifiable en console : __dyn.moisFr(-1, new Date(2026, 0, 15)) → "décembre"
window.__dyn = { moisFr, placesRestantes };

/* ---------- « d'où viennent-ils ? » : bloc méthodologie repliable ---------- */
(() => {
  const btn = document.getElementById("methode-toggle");
  const bloc = document.getElementById("methode");
  if (!btn || !bloc) return;
  btn.addEventListener("click", () => {
    const ouvert = bloc.hidden;
    bloc.hidden = !ouvert;
    btn.setAttribute("aria-expanded", String(ouvert));
  });
})();

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
    "rédigée à partir des seules infos publiques de votre site.";
  const note = document.createElement("p");
  note.className = "results-sub";
  note.textContent =
    "En production, votre système SAV aura été entraîné sur la manière dont vous répondez et " +
    "interagissez avec vos clients — pour des réponses 100 % pertinentes et cohérentes avec votre " +
    "entreprise et la question de chaque client — avec, en plus, le statut exact de chaque commande " +
    "sous les yeux.";
  resultsEl.append(title, sub, note);

  data.exchanges.slice(0, 3).forEach((x) => {
    resultsEl.append(buildExchange(x, "Réponse de votre agent"));
  });

  resultsEl.append(buildPasteBlock(), buildCallCta());

  resultsEl.hidden = false;
  resultsEl.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
  setupStickyCall();
  return true;
};

/* Une paire email client → réponse de l'agent */
const buildExchange = (x, badgeText) => {
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
  badge.textContent = badgeText;
  const rbody = document.createElement("p");
  rbody.className = "r-body";
  rbody.textContent = x.reply_body || "";
  rep.append(badge, rbody);

  ex.append(mail, rep);
  return ex;
};

/* Lead courant (page resultats) : sert au second appel « vrais emails » */
let currentLead = null;

/* Upgrade optionnel, APRÈS le wow : coller 2-3 vrais emails clients.
   Second appel au webhook avec mode "vrais_emails" — brouillons instantanés
   à l'écran, versions relues par un humain envoyées par email ensuite. */
const buildPasteBlock = () => {
  const box = document.createElement("div");
  box.className = "paste-block";

  const title = document.createElement("p");
  title.className = "paste-title";
  title.textContent = "Encore plus fort : collez 2-3 vrais emails clients, et regardez ce que l'agent leur répondrait.";

  const ta = document.createElement("textarea");
  ta.rows = 5;
  ta.placeholder = "Collez ici le contenu de 2 ou 3 emails clients récents — texte brut, dans n'importe quel ordre.";

  const actions = document.createElement("div");
  actions.className = "paste-actions";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-primary";
  btn.textContent = "Voir les réponses à mes emails";
  const note = document.createElement("p");
  note.className = "paste-note";
  actions.append(btn, note);

  const out = document.createElement("div");
  out.className = "paste-out";

  btn.addEventListener("click", async () => {
    const txt = ta.value.trim();
    if (txt.length < 40) {
      note.textContent = "Collez au moins un email complet (quelques phrases).";
      return;
    }
    if (!FORM_ENDPOINT || !currentLead) {
      note.textContent = "Ce service ouvre très bientôt — en attendant, transférez-les à " + ESSAI_EMAIL + " : réponses vérifiées sous quelques heures.";
      return;
    }
    btn.disabled = true;
    btn.textContent = "L'agent rédige…";
    note.textContent = "";
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...currentLead, mode: "vrais_emails", emails: txt }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json().catch(() => null);
      if (!json || !Array.isArray(json.exchanges) || !json.exchanges.length) throw new Error("vide");
      out.textContent = "";
      json.exchanges.forEach((x) => {
        out.append(buildExchange(x, "Brouillon de votre agent"));
      });
      const dn = document.createElement("p");
      dn.className = "draft-note";
      dn.textContent = "Brouillons instantanés : les éléments entre [crochets] se remplissent automatiquement en production, quand l'agent a vos commandes sous les yeux. La version relue par notre équipe arrive dans votre boîte sous quelques heures.";
      out.append(dn);
      ta.value = "";
      btn.textContent = "Voir les réponses à mes emails";
      btn.disabled = false;
    } catch (e) {
      btn.textContent = "Voir les réponses à mes emails";
      btn.disabled = false;
      note.textContent = "Petit souci technique — transférez-les à " + ESSAI_EMAIL + " : réponses vérifiées sous quelques heures.";
    }
  });

  box.append(title, ta, actions, out);
  return box;
};

/* CTA flottant « Réserver un appel » : apparaît une fois les résultats
   rendus, s'efface quand le bloc Calendly est à l'écran */
const setupStickyCall = () => {
  const bar = document.getElementById("sticky-call");
  const target = document.getElementById("reserver");
  if (!bar || !target) return;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      bar.hidden = e.isIntersecting;
    }, { threshold: 0.25 }).observe(target);
  }
  bar.hidden = false;
};

/* Bloc de réservation : phrase d'accroche + Calendly intégré sur la page */
const buildCallCta = () => {
  const cta = document.createElement("div");
  cta.className = "results-cta";
  cta.id = "reserver";
  const hook = document.createElement("p");
  hook.className = "results-hook";
  hook.textContent = "Envie de voir ça tourner sur vos vrais emails, avec vos vraies commandes ?";
  cta.append(hook);
  if (CALL_URL) {
    const frame = document.createElement("iframe");
    frame.className = "calendly-embed";
    frame.src = CALL_URL + (CALL_URL.includes("?") ? "&" : "?") +
      "embed_domain=" + location.hostname + "&embed_type=Inline" +
      "&hide_gdpr_banner=1&background_color=fffdf9&primary_color=c4552d&text_color=1a1a18";
    frame.title = "Réserver un appel";
    frame.loading = "lazy";
    cta.append(frame);
  } else {
    const ph = document.createElement("p");
    ph.className = "calendly-ph";
    const mark = document.createElement("mark");
    mark.textContent = "[Intégration Calendly — remplir CALL_URL en haut de script.js]";
    ph.append(mark);
    cta.append(ph);
  }
  return cta;
};

// Aperçu / débogage : window.__essaiDemo({prenom, exchanges:[…]}) dans la console
window.__essaiDemo = showResults;

/* Repli (webhook en échec ou trop lent) : le lead est déjà enregistré côté
   Make, on donne la marche à suivre par email + le Calendly quand même. */
const renderFallback = (lead) => {
  if (!resultsEl) return;
  resultsEl.textContent = "";
  const title = document.createElement("h3");
  title.className = "results-title";
  title.textContent = "C'est noté" + (lead && lead.prenom ? ", " + lead.prenom : "") + " !";
  const sub = document.createElement("p");
  sub.className = "results-sub";
  sub.textContent =
    "Petit imprévu technique : vos échanges n'ont pas pu s'afficher ici. On vous les envoie " +
    "par email très vite. Pour accélérer, vous pouvez transférer 3 à 10 emails clients récents à " +
    ESSAI_EMAIL + " — réponses rédigées par l'agent et vérifiées par un humain.";
  resultsEl.append(title, sub, buildCallCta());
  resultsEl.hidden = false;
  setupStickyCall();
};

/* ---------- Page resultats.html : chargement → génération → affichage ---------- */
if (document.body.classList.contains("page-resultats") && loadingEl && resultsEl) {
  let lead = null;
  try {
    lead = JSON.parse(sessionStorage.getItem("essai-lead") || "null");
  } catch (e) { /* stockage indisponible */ }
  currentLead = lead;

  if (!lead) {
    // Arrivée directe sans passer par le formulaire : retour à l'essai
    window.location.replace("index.html#essai");
  } else if (!FORM_ENDPOINT) {
    renderFallback(lead);
  } else {
    (async () => {
      const stopLoading = showLoading();
      const ctrl = "AbortController" in window ? new AbortController() : null;
      const timeout = ctrl ? setTimeout(() => ctrl.abort(), 150000) : null;
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(lead),
          signal: ctrl ? ctrl.signal : undefined,
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json().catch(() => null);
        stopLoading();
        if (!(json && showResults({ ...json, prenom: lead.prenom }))) renderFallback(lead);
      } catch (err) {
        stopLoading();
        renderFallback(lead);
      } finally {
        if (timeout) clearTimeout(timeout);
        try { sessionStorage.removeItem("essai-lead"); } catch (e) {}
      }
    })();
  }
}

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
      // Les résultats s'affichent sur une page dédiée : on dépose le lead
      // en sessionStorage et resultats.html fait l'appel + le rendu.
      try {
        sessionStorage.setItem("essai-lead", JSON.stringify(data));
        window.location.href = "resultats.html";
      } catch (e) {
        // Stockage indisponible (navigation privée ancienne) : on enregistre
        // le lead directement, puis confirmation classique sur place.
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).catch(() => {});
        form.reset();
        showConfirmation(data.prenom);
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
