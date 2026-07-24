# ⚠️ Données à vérifier avant mise en ligne

Toutes les valeurs ci-dessous sont **inventées** pour permettre de juger le design.
Elles doivent être remplacées par des données réelles avant publication.

> **Rappel juridique** : témoignages fictifs et chiffres inventés = pratique commerciale
> trompeuse (DGCCRF). Les échanges publiés exigent l'accord écrit des boutiques et
> l'anonymisation du client final.

---

## 1. Chiffres agrégés — barre de preuve (S3)

| Affiché | Nature | À faire |
|---|---|---|
| 11 620 tickets traités le mois dernier | inventé | total réel sur les boutiques équipées |
| 89 % sans votre intervention | inventé | taux réel |
| < 2 h de première réponse | inventé | délai médian réel |
| « +30 boutiques » (titre S7 et note S3) | à confirmer | nombre exact au moment de la mise en ligne |

## 2. Mécanisme (S5)

| Affiché | À faire |
|---|---|
| setup en **5 jours** | délai réel moyen |
| **trois premières semaines** de validation à 100 % | durée réelle de rodage |
| Rapport de juin · **412 tickets · 19 h récupérées** | rapport réel d'une boutique |
| Motif anormal : **37 questions** sur la collection Été | exemple réel de motif détecté |
| Échange Léa B. (échange de taille) | échange réel, client anonymisé |

## 3. Cas client (S6)

| Affiché | À faire |
|---|---|
| **Maison Lyra**, 60 000 €/mois, gérée à deux | vraie boutique + accord écrit |
| + 80 h · − 22 h · + 24 % | mesures réelles |
| 3 h/jour → 20 min/jour | mesures réelles |
| sept. 2025 → mars 2026 | période réelle |
| Citation « Dix ans à construire la confiance… » — Camille D. | vraie citation, vraie personne. Garder l'angle : la peur pour l'image, levée par l'impossibilité technique |
| Initiales **CD** dans la pastille | remplacer par une photo réelle |

**⚠️ Cohérence** : la courbe et les métriques doivent concorder. 3 h/jour → 20 min/jour, soit
2 h 40 gagnées par jour × 30 jours ≈ 80 h/mois. Si les vrais chiffres diffèrent, recalculer.

## 4. Échanges et témoignages (S7)

Les 5 boutiques sont **inventées** : Maison Lyra (Lyon), Baume & Sève (Nantes),
Atelier Ombre (Bordeaux), Bois & Lin (Lille). Vérifier qu'aucune entreprise réelle
ne porte ces noms avant toute publication, ou les remplacer directement par tes clients.

Les 5 échanges (clients Marie L., Karim T., Sarah M., Antoine R., Nadia B.) sont inventés.
La carte client du hero (Julie R., commande n° 2843) est inventée aussi.

La 5e carte est un cas sensible : **aucune réponse n'est envoyée au client**. L'agent envoie
une alerte interne au gérant avec le contexte et une suggestion de réponse. Garder ce
fonctionnement avec le vrai exemple — c'est la démonstration du garde-fou.

Les 3 témoignages (Sophie M., Thomas D., Inès F.) sont inventés — désormais dans une section
« Avis » dédiée, placée juste avant le tarif. Chacun affiche une **crainte nommée** et un
**profil boutique** (secteur · taille équipe · CA), tous deux inventés :
- Sophie M. — Déco · 2 personnes · ~45 k€/mois — crainte « l'IA va dire n'importe quoi »
- Thomas D. — Mobilier · 3 personnes · ~90 k€/mois — crainte « pas le temps »
- Inès F. — Cosmétique · solo · ~30 k€/mois — crainte « mes clients veulent un humain »
Le profil boutique est le levier d'identification : garder des profils proches de l'avatar
(1-3 personnes, 30-100 k€/mois). Initiales (SM, TD, IF) → photos réelles.

## 5. Fondateur (S9) — lettre

- Section réécrite en **lettre de fondateur** (recherche multi-agents : format épistolaire + founder-market fit).
- L'histoire (6 ans, 30+ boutiques, équipes SAV coûteuses + turnover, système IA perso) est **vraie** : à valider/ajuster par Hugo.
- Faits : plus de 30 boutiques **créées** en 6 ans (beaucoup n'existent plus) ; **6 boutiques actives** aujourd'hui, gérées par le système SAV d'Hugo. À vérifier avant mise en ligne.
- `[Photo d'Hugo — candid à son bureau]` : prévoir une vraie photo en situation (pas de studio, pas de stock), coins arrondis. Toujours en jaune sur la page.
- Signature manuscrite en police Caveat : décorative, remplace juste le rendu du prénom.
- La rareté vit dans la section Tarif — voir § « Compteur de places » ci-dessous.

## 6. FAQ (S10)

- Hébergement « dans l'Union européenne », « DPA fourni sur demande » : à confirmer
  avec la réalité technique et contractuelle.

## 7. Restent en surbrillance jaune (volontairement)

Ces deux éléments ne doivent pas être inventés :

- **`[SIREN, adresse]`** dans le pied de page — mention légale obligatoire (LCEN)
- **`[Photo d'Hugo à intégrer]`** en S9

Les pages `mentions-legales.html` et `confidentialite.html` conservent aussi leurs
placeholders : raison sociale, SIREN, hébergeur, base légale, durée de conservation.

## 8. Compteur de places (Tarif) — À TENIR À JOUR À LA MAIN

Le chiffre « X places restantes » est piloté par `PLACES_RESTANTES` en haut de
`script.js`. Routine mensuelle d'Hugo :

1. **Le 1er du mois** : remettre `PLACES_RESTANTES = 10`.
2. **Au fil des inscriptions réelles** : baisser le chiffre.
3. **~5 jours avant la fin du mois** : il doit être descendu à `1`.

⚠️ Le texte de la page promet que ce chiffre est réel et mis à jour à la main
(« mis à jour à la main au fil des inscriptions »). S'il ne bouge jamais, la
promesse devient elle-même une pratique trompeuse. Le tenir à jour, vraiment.
Après chaque modification, bump du `?v=` de `script.js` dans `index.html`
(cache navigateur).

## 9. Formulaire — endpoint à choisir

`FORM_ENDPOINT` (haut de `script.js`) est vide : le formulaire retombe sur un
mailto. Avant mise en ligne : créer un endpoint (Formspark, Basin ou Tally) et
coller son URL. Créer aussi la boîte **essai@onsenoccupe.fr** (elle reçoit les
emails transférés des prospects).

## 10. Ailleurs que sur le site

- `campagne-cold-email-employe-sav/sequence-v1.md` annonce encore « [2] boutiques »
  dans l'email de rupture. À aligner sur « +30 », sinon incohérence avec la page.
- **Cold call** : créer la redirection courte `onsenoccupe.fr/essai` → `/#essai`
  chez Hostinger (à dicter au téléphone), et aligner le script téléphonique sur la
  page : « X places ce mois-ci » (le chiffre du site), essai = 3 à 10 emails.
