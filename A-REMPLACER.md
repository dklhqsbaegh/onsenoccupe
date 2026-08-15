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
| < 15 min de première réponse | inventé | délai médian réel |
| « +30 boutiques » (titre S7 et note S3) | à confirmer | nombre exact au moment de la mise en ligne |

## 1 bis. Moyennes clients — CTA de la page résultats (02/08)

| Affiché | Nature | À faire |
|---|---|---|
| **54 h** récupérées par mois, en moyenne | chiffre d'Hugo (06/08) : ~2 h/jour de SAV × 30 j × 90 % économisés | confirmer sur les données réelles |
| **+60 %** de satisfaction client après 3 mois | chiffre d'Hugo | ⚠️ définir la **base de mesure** (note post-SAV ? avis ? +60 % de quoi à quoi ?) et la documenter — un pourcentage sans base est contestable |
| **100 %** relu par un humain les 3 premières semaines | vrai (fait de fonctionnement) | rien à faire |

Ces chiffres sont présentés comme des **moyennes agrégées** sur les boutiques
clientes. Ils doivent être justifiables sur demande (DGCCRF) : conserver le
calcul et les relevés qui les fondent.

⚠️ **Incohérence à résoudre** : l'artefact « Rapport de juin » de la page
d'accueil (étape 3) affiche « 412 tickets · **19 h récupérées** », soit très
en dessous des 54 h/mois annoncées ici. Aligner ce rapport (≈ 50 h) ou
l'expliquer, sinon un prospect attentif verra la contradiction.

## 2. Mécanisme (S5)

⚠️ **Nouveau (06/08)** : l'étape 3 met en scène une **notification Slack**.
À confirmer : le rapport mensuel est-il vraiment livré par Slack (à câbler
dans Make) ou par email ? Si c'est l'email, adapter le visuel.
Tarif : passé en **commandes/mois** (490 € ≤ 500 · 590 € 500-2 000 · devis
au-delà). Le ratio commandes→tickets (≈ 5-20 %) doit rester tenable :
surveiller sur les premiers clients que 500 commandes ne génèrent pas plus
de tickets que prévu.

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

La section « Avis » (3 témoignages inventés Sophie M., Thomas D., Inès F.) a été
**supprimée** : redondante avec les échanges réels du rail + le cas client + la lettre,
et c'était la seule section entièrement fictive à remplacer. Si de vrais avis clients
arrivent un jour, la réintroduire avec le format crainte nommée + profil boutique
(1-3 personnes, 30-100 k€/mois) — l'historique git a le code (commit 31fd790).

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

## 7. Mentions légales et photo

- **SIREN + adresse** : retirés du pied de page le 27/07 (demande d'Hugo, le
  temps du lancement). ⚠️ LCEN : l'identification de l'éditeur reste
  **obligatoire** sur un site professionnel — à réintégrer (footer et/ou
  mentions légales complétées) AVANT d'envoyer du trafic payant ou des
  campagnes. Ne jamais inventer.
- **`[Photo d'Hugo à intégrer]`** en S9 — ne pas inventer non plus.

Les pages `mentions-legales.html` et `confidentialite.html` sont passées en
**version intérimaire propre** (02/08) : entrepreneur individuel, société en cours
d'immatriculation, hébergeur Hostinger, base légale et durées renseignées. Seul
`[NOM]` reste à remplacer (2 occurrences dans mentions-legales) — puis raison
sociale + SIREN dès l'immatriculation.

## 8. Compteur de places (Tarif) — automatique

Le chiffre « X places restantes » est calculé par `placesRestantes()` dans
`script.js`, selon le jour du mois : 10 le 1er, descente régulière, puis
1 place restante à partir de J-7 jusqu'à la fin du mois. Singulier géré
(« 1 place restante »). Rien à maintenir.

⚠️ DGCCRF : ce décompte est simulé, pas relié aux inscriptions réelles.
Une rareté affichée qui ne correspond à aucune limite réelle est un risque
juridique (pratique commerciale trompeuse). Sécuriser le fond : limiter
réellement les installations à ~10/mois, et si un mois se remplit plus vite,
ajuster.

## 9. Formulaire — backend à brancher

✅ **Branché et testé en production le 01/08** : webhook Make + Pipedrive +
Claude + Calendly. Voir ESSAI-BACKEND.md (état + backlog). L'alias
essai@onsenoccupe.net → hugo@ est créé (filet de secours).

## 10. Ailleurs que sur le site

- `campagne-cold-email-employe-sav/sequence-v1.md` : alignée le 27/07 (breakup
  → « +30 boutiques », rareté = compteur du site, E2 → essai instantané sur la
  page). Reste à remplir les chiffres réels [X/Y/Z] avant envoi.
- **Cold call** : au téléphone on dicte le domaine seul (« onsenoccupe point
  net ») + guidage vers le bouton Essai gratuit. La redirection courte
  `onsenoccupe.net/essai` → `/#essai` (à créer chez Hostinger) sert à
  l'asynchrone : SMS de suivi, vocal, bio LinkedIn. Script aligné sur la
  page : « X places ce mois-ci » (le chiffre du site), essai = l'URL de la
  boutique collée pendant l'appel (30 secondes).
