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

/* L'ancienne scène de démonstration du hero a été remplacée par le
   formulaire d'essai : plus d'effet de scroll ni d'entrée à animer. */

/* ---------- Timeline des étapes : la barre se remplit au défilement ---------- */
(() => {
  const steps = document.getElementById("steps");
  const fill = document.getElementById("steps-fill");
  if (!steps || !fill) return;
  const items = [...steps.querySelectorAll(".step")];

  const render = () => {
    const r = steps.getBoundingClientRect();
    const ancre = window.innerHeight * 0.55;          // ligne de lecture
    const p = Math.min(Math.max((ancre - r.top) / r.height, 0), 1);
    fill.style.height = (p * 100).toFixed(1) + "%";
    items.forEach((el) => {
      const c = el.getBoundingClientRect();
      el.classList.toggle("is-active", c.top <= ancre);
    });
  };

  let tick = false;
  const onScroll = () => {
    if (tick) return;
    tick = true;
    requestAnimationFrame(() => { render(); tick = false; });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  render();
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

const DUREE_ATTENDUE = 25; // secondes annoncées au visiteur

/* Écran d'attente : la génération prend ~20 s et c'est là qu'on perd le plus
   de monde. On montre une progression réelle, le travail accompli, et de quoi
   entretenir l'envie de voir le résultat. */
const showLoading = (lead) => {
  if (!loadingEl) return () => {};
  loadingEl.textContent = "";

  const kicker = document.createElement("p");
  kicker.className = "load-kicker";
  kicker.textContent = "Analyse en cours";

  // C'est SA boutique qu'on analyse : on l'affiche.
  const titre = document.createElement("h2");
  titre.className = "load-titre";
  let domaine = "";
  try {
    domaine = new URL(lead && lead.boutique ? lead.boutique : "").hostname.replace(/^www\./, "");
  } catch (e) {}
  titre.textContent = domaine ? "On lit " + domaine : "On lit votre boutique";

  const barre = document.createElement("div");
  barre.className = "load-bar";
  const fill = document.createElement("span");
  fill.className = "load-fill";
  barre.append(fill);

  const compteur = document.createElement("p");
  compteur.className = "load-time";

  // Chaque ligne cochée est une preuve visible d'avancement.
  const etapes = [
    ["Connexion à votre boutique", 0],
    ["Lecture de vos pages produits, livraison, retours", 3],
    ["Repérage des questions que vos clients posent le plus", 8],
    ["Rédaction des trois réponses, dans votre ton", 13],
    ["Vérification : aucune information inventée", 20],
  ];
  const liste = document.createElement("ul");
  liste.className = "load-list";
  const lis = etapes.map(function (e) {
    const li = document.createElement("li");
    const puce = document.createElement("span");
    puce.className = "load-puce";
    const lbl = document.createElement("span");
    lbl.textContent = e[0];
    li.append(puce, lbl);
    liste.append(li);
    return li;
  });

  const desirs = [
    "Ce que vous allez lire, vos clients pourraient le recevoir dès la semaine prochaine.",
    "Chaque réponse est rédigée à partir de VOS pages — jamais d'un modèle générique.",
    "Les questions qui reviennent chez vous reviennent partout : ce sont les plus simples à déléguer.",
    "L'objectif : que vos soirées commencent à 19 h, pas après le dernier email.",
  ];
  const desir = document.createElement("p");
  desir.className = "load-desir";
  desir.textContent = desirs[0];

  /* Réassurance — à cet instant le prospect vient de livrer l'URL de sa
     boutique et son email, et une machine « lit » son site. Sa crainte n'est
     pas le prix : c'est l'intrusion. On répond à celle-là, en nommant ce
     qu'on NE fait pas. */
  const rass = document.createElement("div");
  rass.className = "load-rass";
  const rTitre = document.createElement("p");
  rTitre.className = "load-rass-titre";
  rTitre.textContent = "Pendant ce temps, ce qu'on ne fait pas";
  rass.append(rTitre);

  [
    ["On ne touche à rien", "On lit vos pages publiques, exactement comme le ferait un visiteur. Aucun accès à votre boutique, à votre boîte mail ni à vos commandes."],
    ["On ne vous inscrit à rien", "Pas de newsletter, pas de relance automatique. Votre adresse sert à vous envoyer ces réponses, rien d'autre."],
    ["On ne garde rien pour entraîner des modèles", "Vos données restent hébergées dans l'Union européenne."],
  ].forEach(function (r) {
    const li = document.createElement("p");
    li.className = "load-rass-item";
    const f = document.createElement("strong");
    f.textContent = r[0] + ". ";
    li.append(f, document.createTextNode(r[1]));
    rass.append(li);
  });

  loadingEl.append(kicker, titre, barre, compteur, liste, desir, rass);
  loadingEl.hidden = false;

  const depart = Date.now();
  let iDesir = 0;

  const tick = setInterval(function () {
    const ecoule = (Date.now() - depart) / 1000;

    // La barre plafonne à 96 % : une barre pleine sur un écran figé est pire
    // que pas de barre du tout.
    fill.style.width = Math.min(96, (ecoule / DUREE_ATTENDUE) * 96).toFixed(1) + "%";

    const reste = Math.ceil(DUREE_ATTENDUE - ecoule);
    compteur.textContent = reste > 0
      ? "Environ " + reste + " seconde" + (reste > 1 ? "s" : "") + " — ne fermez pas cette page"
      : "Encore quelques instants, on y est presque";

    lis.forEach(function (li, k) { li.classList.toggle("on", ecoule >= etapes[k][1]); });

    if (ecoule > 6 * (iDesir + 1) && iDesir < desirs.length - 1) {
      iDesir += 1;
      desir.classList.add("fade");
      setTimeout(function () {
        desir.textContent = desirs[iDesir];
        desir.classList.remove("fade");
      }, 260);
    }
  }, 200);

  return function () {
    clearInterval(tick);
    loadingEl.hidden = true;
  };
};

const showResults = (data) => {
  if (!resultsEl || !data || !Array.isArray(data.exchanges) || !data.exchanges.length) return false;
  resultsEl.textContent = "";

  resultsEl.append(buildResultsHero(data.prenom, data.exchanges.length));
  resultsEl.append(buildRail(data.exchanges.slice(0, 3), "Réponse de votre agent"));
  resultsEl.append(buildProdNote());
  resultsEl.append(buildCallCta());

  resultsEl.hidden = false;
  resultsEl.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
  setupStickyCall();
  return true;
};

/* Petites icônes de la page résultats — même style que les SVG du site */
const ICONES = {
  eclair: '<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>',
  cadenas: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  courbe: '<polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/>',
};
const icone = (nom) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = ICONES[nom] || "";
  return svg;
};

/* Bandeau d'en-tête de la page résultats : statut « prêt », titre,
   3 puces de contexte, et la promesse production en encadré. */
const buildResultsHero = (prenom, nb) => {
  const hero = document.createElement("header");
  hero.className = "results-hero";

  const badge = document.createElement("p");
  badge.className = "rh-badge";
  const dot = document.createElement("span");
  dot.className = "live-dot";
  dot.setAttribute("aria-hidden", "true");
  badge.append(dot, document.createTextNode("Votre essai est prêt"));

  const title = document.createElement("h1");
  title.className = "rh-title";
  title.textContent = "Voici ce que vos clients recevraient" + (prenom ? ", " + prenom : "") + ".";

  const sub = document.createElement("p");
  sub.className = "rh-sub";
  sub.textContent =
    (nb > 1 ? nb + " échanges typiques" : "Un échange typique") +
    " de votre boutique — et la réponse que notre agent enverrait, rédigée à partir des seules infos publiques de votre site.";

  const facts = document.createElement("ul");
  facts.className = "rh-facts";
  [
    ["eclair", "Généré à l'instant", "sur vos pages publiques"],
    ["cadenas", "Sans aucun accès", "à votre boîte ni à vos commandes"],
    ["courbe", "Le minimum", "de ce que l'agent sait faire"],
  ].forEach(([ico, fort, reste]) => {
    const li = document.createElement("li");
    const txt = document.createElement("span");
    const b = document.createElement("strong");
    b.textContent = fort;
    txt.append(b, document.createTextNode(" " + reste));
    li.append(icone(ico), txt);
    facts.append(li);
  });

  const scrollHint = document.createElement("p");
  scrollHint.className = "rh-scroll";
  scrollHint.setAttribute("aria-hidden", "true");
  const chev = document.createElement("span");
  chev.className = "rh-chev";
  scrollHint.append(document.createTextNode("Vos échanges juste en dessous"), chev);

  hero.append(badge, title, sub, facts, scrollHint);
  return hero;
};

/* Note de production — sous le slider, en petit et en italique */
const buildProdNote = () => {
  const note = document.createElement("p");
  note.className = "prod-note";
  note.textContent =
    "En production, votre système SAV aura été entraîné sur la manière dont vous répondez et " +
    "interagissez avec vos clients — pour des réponses 100 % pertinentes et cohérentes avec votre " +
    "entreprise — avec, en plus, le statut exact de chaque commande sous les yeux.";
  return note;
};

/* Slider des échanges — même mécanique que le rail de la page d'accueil */
const buildRail = (exchanges, badgeText) => {
  const wrap = document.createElement("div");
  wrap.className = "results-rail-wrap";

  const head = document.createElement("div");
  head.className = "results-rail-head";

  const rail = document.createElement("div");
  rail.className = "results-rail";
  rail.tabIndex = 0;
  rail.setAttribute("aria-label", "Vos échanges générés — faites défiler");
  exchanges.forEach((x) => rail.append(buildExchange(x, badgeText)));

  const dots = document.createElement("div");
  dots.className = "rail-dots";
  dots.setAttribute("aria-hidden", "true");
  const puces = exchanges.map(() => {
    const d = document.createElement("span");
    d.className = "dot";
    dots.append(d);
    return d;
  });

  const nav = document.createElement("div");
  nav.className = "results-rail-nav";
  const mkBtn = (dir, label) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "rail-btn";
    b.dataset.dir = String(dir);
    b.setAttribute("aria-label", label);
    b.textContent = dir < 0 ? "‹" : "›";
    return b;
  };
  const prev = mkBtn(-1, "Échange précédent");
  const next = mkBtn(1, "Échange suivant");
  nav.append(prev, next);

  const pas = () => {
    const carte = rail.querySelector(".result-exchange");
    if (!carte) return rail.clientWidth * 0.9;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 16;
    return carte.getBoundingClientRect().width + gap;
  };
  const maj = () => {
    const max = rail.scrollWidth - rail.clientWidth - 2;
    prev.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft >= max;
    const idx = Math.min(puces.length - 1, Math.round(rail.scrollLeft / pas()));
    puces.forEach((d, i) => d.classList.toggle("on", i === idx));
  };
  [prev, next].forEach((b) =>
    b.addEventListener("click", () => {
      rail.scrollBy({ left: Number(b.dataset.dir) * pas(), behavior: prefersReduced ? "auto" : "smooth" });
    })
  );
  rail.addEventListener("scroll", maj, { passive: true });

  head.append(nav);
  wrap.append(head, rail, dots);
  requestAnimationFrame(maj);
  return wrap;
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

/* Lead courant (page resultats) : prénom et boutique pour l'affichage */
let currentLead = null;

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
  // Rareté — même source que la page tarif (chiffre identique partout)
  const rarete = document.createElement("p");
  rarete.className = "results-rarete";
  const dot = document.createElement("span");
  dot.className = "live-dot";
  dot.setAttribute("aria-hidden", "true");
  const n = placesRestantes();
  rarete.append(
    dot,
    document.createTextNode(
      "Plus que " + (n === 1 ? "1 place" : n + " places") + " en " + (moisFr(0) || "ce mois-ci")
    )
  );

  const hook = document.createElement("p");
  hook.className = "results-hook";
  hook.textContent = "Est-ce que ça marcherait sur VOTRE boutique ? Parlons-en 15 minutes.";
  const sub = document.createElement("p");
  sub.className = "results-cta-sub";
  sub.textContent =
    "Vos questions, sans filtre : comment ça marche vraiment, ce que ça change dans " +
    "votre quotidien, et si je le recommande pour votre boutique.";

  // Ce que ça donne chez nos boutiques clientes (moyennes agrégées)
  const stats = document.createElement("ul");
  stats.className = "results-stats";
  [
    ["54 h", "récupérées par mois, en moyenne"],
    ["+60 %", "de satisfaction client après 3 mois"],
    ["100 %", "relu par un humain les 3 premières semaines"],
  ].forEach(([v, k]) => {
    const li = document.createElement("li");
    const val = document.createElement("span");
    val.className = "rs-v";
    val.textContent = v;
    const lib = document.createElement("span");
    lib.className = "rs-k";
    lib.textContent = k;
    li.append(val, lib);
    stats.append(li);
  });

  cta.append(rarete, hook, sub);

  if (CALL_URL) {
    const a = document.createElement("a");
    a.className = "btn btn-primary";
    a.href = CALL_URL;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Réserver mon appel de 15 minutes";
    const micro = document.createElement("p");
    micro.className = "results-cta-micro";
    micro.textContent = "Créneaux cette semaine · sans engagement";
    cta.append(a, micro);
  }
  cta.append(stats);
  if (!CALL_URL) {
    const ph = document.createElement("p");
    ph.className = "calendly-ph";
    const mark = document.createElement("mark");
    mark.textContent = "[Lien Calendly — remplir CALL_URL en haut de script.js]";
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
    "Pour découvrir les réponses que notre agent enverrait à vos clients, réservez " +
    "un appel gratuit de 15 minutes : on les parcourt ensemble, sur vos propres cas.";
  resultsEl.append(title, sub);

  // CTA réduit au bouton : sur cette page, tout ce qui s'intercale entre la
  // phrase et Calendly éloigne du seul geste utile.
  if (CALL_URL) {
    const a = document.createElement("a");
    a.className = "btn btn-primary fallback-cta";
    a.href = CALL_URL;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Réserver mon appel de 15 minutes";
    const micro = document.createElement("p");
    micro.className = "results-cta-micro";
    micro.textContent = "Créneaux cette semaine · sans engagement";
    resultsEl.append(a, micro);
  } else {
    resultsEl.append(buildCallCta());
  }
  resultsEl.hidden = false;
  setupStickyCall();
};

/* ---------- Page resultats.html : chargement → génération → affichage ---------- */
if (document.body.classList.contains("page-resultats") && loadingEl && resultsEl) {
  // ── Mode aperçu : resultats.html?demo — rend la page avec des échanges
  //    d'exemple, sans appeler le webhook (aucun crédit consommé). ──
  const apercu = new URLSearchParams(location.search).get("demo");

  // ── resultats.html?demo=chargement — rejoue l'écran d'attente en boucle,
  //    sans appeler le webhook (aucun crédit consommé). Sert à relire cet
  //    écran, qui n'existe autrement que 20 secondes pendant un vrai essai. ──
  if (apercu === "chargement") {
    (function boucle() {
      const stop = showLoading({ prenom: "Camille", boutique: "https://mondevanille.com/" });
      const flag = document.createElement("p");
      flag.className = "demo-flag";
      flag.textContent = "Aperçu interne — écran d'attente, aucun appel à l'agent";
      loadingEl.prepend(flag);
      setTimeout(function () { stop(); boucle(); }, (DUREE_ATTENDUE + 6) * 1000);
    })();
    window.scrollTo(0, 0);
  } else if (apercu !== null) {
    showResults({
      prenom: "Camille",
      exchanges: [
        {
          from: "Client — Léa",
          subject: "Où est ma commande ?",
          body:
            "Bonjour, j'ai commandé le coffret céramique dimanche dernier et je n'ai " +
            "toujours aucune nouvelle. Pouvez-vous me dire où elle en est ? J'en ai " +
            "besoin pour un anniversaire samedi. Merci d'avance.",
          reply_body:
            "Bonjour Léa,\n\nMerci pour votre message, et désolé pour cette attente. " +
            "Votre commande [numéro de commande] a été expédiée le [date d'expédition] " +
            "via [transporteur] — vous pouvez suivre son acheminement ici : [lien de suivi]. " +
            "La livraison est estimée pour le [date estimée de livraison], donc avant samedi.\n\n" +
            "Belle journée,\nL'équipe de la boutique",
        },
        {
          from: "Client — Marc",
          subject: "Demande d'échange",
          body:
            "Bonjour, j'ai reçu ma commande mais la teinte de la tasse ne correspond pas " +
            "à celle du site. Le produit n'a pas servi : un échange est-il possible ?",
          reply_body:
            "Bonjour Marc,\n\nBien sûr, et navré pour cette différence. Pourriez-vous me " +
            "confirmer votre [numéro de commande] ainsi que la référence reçue ? Je vous " +
            "envoie ensuite la marche à suivre pour l'échange, selon nos conditions de retour.\n\n" +
            "Dans l'attente de votre retour,\nL'équipe de la boutique",
        },
        {
          from: "Client — Anna",
          subject: "Question sur le vase Terra",
          body:
            "Bonjour, je souhaite offrir le vase Terra. Passe-t-il au lave-vaisselle ? " +
            "Et est-il livré dans un emballage cadeau ?",
          reply_body:
            "Bonjour Anna,\n\nMerci pour votre intérêt ! D'après notre fiche produit, le " +
            "vase Terra se nettoie à la main : l'émail n'apprécie pas le lave-vaisselle. " +
            "Pour l'emballage cadeau, je vérifie ce qu'il est possible de faire sur votre " +
            "commande et je reviens vers vous rapidement.\n\nBelle idée de cadeau,\n" +
            "L'équipe de la boutique",
        },
      ],
    });
    const flag = document.createElement("p");
    flag.className = "demo-flag";
    flag.textContent = "Aperçu interne — échanges d'exemple, aucun appel à l'agent";
    resultsEl.prepend(flag);
    window.scrollTo(0, 0);
  } else {

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
      const stopLoading = showLoading(lead);
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
        // Le modèle encadre parfois sa réponse de balises ```json : on lit le
        // texte brut et on retire ces balises avant de parser.
        const json = await res.text().then((t) => {
          try {
            return JSON.parse(t.trim().replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/, ""));
          } catch (e) {
            return null;
          }
        }).catch(() => null);
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
}

/* ---------- Formulaire essai gratuit : validation + POST ou fallback mailto ---------- */
document.querySelectorAll("[data-essai-form]").forEach((form) => {
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
      "Pour découvrir les réponses que notre agent enverrait à vos clients, " +
      "réservez un appel gratuit de 15 minutes : on les parcourt ensemble.";

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
});
