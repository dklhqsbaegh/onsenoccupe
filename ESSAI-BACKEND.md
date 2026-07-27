# Essai gratuit — backend à brancher (Make + Brevo + API Claude)

Le front est prêt : quand `FORM_ENDPOINT` (haut de `script.js`) est rempli,
le clic sur « Essayer sur mes emails » dépose le lead en sessionStorage et
redirige vers **resultats.html** (page dédiée) : écran de chargement
(« On lit votre boutique… »), puis les 3 échanges s'affichent, suivis de la
phrase sur l'entraînement en production et du **Calendly intégré**
(`CALL_URL`). C'est resultats.html qui fait le POST vers le webhook.
En cas d'échec ou d'arrivée directe sans formulaire : repli propre
(confirmation + Calendly, ou retour à l'accueil). Tant que `FORM_ENDPOINT`
est vide, le formulaire garde son comportement mailto actuel — rien n'est
cassé.

## 1. À remplir dans `script.js`

| Constante | Valeur |
|---|---|
| `FORM_ENDPOINT` | URL du webhook Make (scénario ci-dessous) |
| `CALL_URL` | Lien Calendly (ex. `https://calendly.com/onsenoccupe/15min`), intégré en iframe sous les résultats ; placeholder jaune si vide |

Après modification : bump du `?v=` de `script.js` dans `index.html`.

## 2. Contrat du webhook

**Appel 1 — génération depuis l'URL** (envoyé par resultats.html au
chargement) :

```json
POST FORM_ENDPOINT
Content-Type: application/json
{
  "prenom": "Camille",
  "email": "camille@boutique.fr",
  "boutique": "https://boutique.fr"
}
```

**Appel 2 — vrais emails collés** (envoyé quand le lead utilise le bloc
« Encore plus fort » sous les résultats) :

```json
POST FORM_ENDPOINT
Content-Type: application/json
{
  "prenom": "Camille",
  "email": "camille@boutique.fr",
  "boutique": "https://boutique.fr",
  "mode": "vrais_emails",
  "emails": "…contenu collé par le lead…"
}
```

Réponse : même contrat `exchanges` (les brouillons s'affichent avec le badge
« Brouillon de votre agent » + la mention « version relue par notre équipe
sous quelques heures »). Le scénario Make doit alors AUSSI notifier Hugo :
relire ces brouillons et envoyer la version vérifiée par email au lead —
c'est la promesse affichée.

**Réponse attendue** (HTTP 200, JSON, sous ~150 s — au-delà resultats.html
abandonne et affiche le repli : consigne de transfert + Calendly) :

```json
{
  "exchanges": [
    {
      "from": "Client — Léa",
      "subject": "Où est ma commande ?",
      "body": "Bonjour, j'ai commandé votre [produit réel du site] dimanche…",
      "reply_body": "Bonjour Léa,\n\n…réponse de l'agent…\n\nBonne journée,\nL'équipe [Boutique]"
    }
  ]
}
```

3 éléments dans `exchanges` (la page n'en affiche pas plus). Les corps de
texte peuvent contenir des `\n` (rendus à la ligne). Si la réponse est vide,
invalide ou en erreur, la page retombe proprement sur la confirmation
classique : le lead n'est jamais perdu, il faut juste que le webhook ait
enregistré le contact AVANT de générer.

## 3. Scénario Make (dans l'ordre)

1. **Webhook custom** — reçoit le JSON ci-dessus. Router selon `mode` :
   absent → appel 1 (génération boutique) ; `"vrais_emails"` → appel 2
   (réponses aux emails collés, + tâche de relecture pour Hugo).
2. **Brevo : créer/mettre à jour le contact** + l'affaire dans le pipeline
   *Lead → Essai livré → Emails réels reçus → Call booké → Pilote → Client*.
   (Fait en premier : si la génération échoue, le lead est déjà sauvé.)
3. **HTTP GET** sur l'URL de la boutique (+ pages /faq, /livraison,
   /cgv si détectables) — texte brut tronqué à ~15 000 caractères.
4. **HTTP POST api.anthropic.com/v1/messages** (modèle récent, voir prompt §4).
5. **Webhook response** — renvoie le JSON `exchanges` (délai total < 150 s).
6. **Email de notification à Hugo** : nouveau lead, avec drapeau « a collé
   des vrais emails » si `emails` est présent (→ tâche : réponses vérifiées
   à envoyer sous quelques heures).

Boîte `essai@onsenoccupe.fr` (à créer chez Hostinger) : surveillée par un
second scénario Make (IMAP) qui rattache les transferts au contact Brevo
via l'adresse d'expédition et passe l'affaire en « Emails réels reçus ».

## 4. Prompt de génération (étape 4 du scénario)

```
Tu écris pour la boutique e-commerce dont voici le contenu public :
---
{{texte scrappé}}
---
Génère exactement 3 échanges email SAV typiques pour CETTE boutique,
en français, au format JSON strict :
{"exchanges":[{"from":"Client — Prénom","subject":"…","body":"…","reply_body":"…"}]}

Contraintes :
- Les 3 cas : (1) « où est ma commande ? », (2) demande de retour ou
  d'échange, (3) question produit précise sur un VRAI produit du site.
- Les emails clients : ton réel de client (pressé, poli, parfois inquiet),
  3-5 phrases, mentionnent de vrais produits/collections du site.
- Les réponses : uniquement à partir des infos publiques fournies (délais,
  conditions de retour réels du site). Si une info manque, la réponse dit
  honnêtement qu'elle vérifie et revient vers le client — ne JAMAIS inventer
  un délai, un prix ou une politique.
- Signature : « L'équipe {{nom de la boutique}} ».
- Aucun remboursement promis, aucun geste commercial engagé.
```

## 5. Copie de la page à ajuster QUAND le backend sera branché

Le texte actuel promet « transférez 3 à 10 emails » en premier. Une fois le
flux en place, inverser la promesse (l'URL suffit, le transfert devient le
booster) :

- **Pitch S11** : « Indiquez simplement l'adresse de votre boutique : notre
  agent lit vos pages publiques et rédige sous vos yeux 3 échanges clients
  complets — vos produits, vos délais, votre ton. » (Le « collez vos vrais
  emails » n'est plus promis ici : il vit sur la page de résultats, après
  la démonstration.)
- **FAQ « ça a l'air trop beau »** : même inversion.
- **Bouton** : « Voir les réponses de mon agent » peut remplacer
  « Essayer sur mes emails ».
- **Confirmation mailto** : ne sert plus que si le webhook tombe.

## 6. Test sans backend

Sur resultats.html, dans la console du navigateur :

```js
__essaiDemo({prenom:"Camille", exchanges:[
  {from:"Client — Léa", subject:"Où est ma commande ?",
   body:"Bonjour, j'ai commandé dimanche et je n'ai aucune nouvelle…",
   reply_body:"Bonjour Léa,\n\nVotre commande a été expédiée hier…\n\nL'équipe Boutique"}
]})
```
