# Liaisons mécaniques et schéma cinématique : cours et exercices interactifs

Pages autonomes (un fichier HTML par page, aucune dépendance externe, utilisables hors ligne), publiées par
GitHub Pages. L'accueil reprend la construction du dépôt RDM : une grille « Les cours » et une grille
« Les exercices », avec les pastilles **Niveau 1** (vert) et **Niveau 2** (bleu).

| Page | Contenu |
|---|---|
| `index.html` | accueil : grille des cours, grille des exercices |
| `cours-1-1-liaisons-mecaniques.html` | Cours 1.1 — Les liaisons mécaniques (Niveau 1), interactif |
| `cours-1-2-…`, `cours-2-1-…`, `cours-2-2-…` | cours 1.2 (Niveau 2), 2.1 et 2.2 (schéma cinématique) — « En cours d'édition » |
| `exercice-1-degres-de-liberte.html` | Exercice 1.1 — Degrés de liberté (Niveau 1) : choix de la série |
| `exercice-1-degres-de-liberte-serie-1.html` … `serie-3.html` | séries 1 à 3, sur le même moteur que l'exercice 2.1 |
| `exercice-2-eolienne.html`, `-support-smartphone`, `-imprimante-3d`, `-grue-camera` | Exercice 2.1 — toutes les liaisons d'un système réel (Niveau 1) |

## Cours 1.1 — Les liaisons mécaniques (Niveau 1)

Source : « Cours – Les liaisons mécaniques » (3 pages). Sept étapes :

1. **Définition** : arbre et support animés, zone de contact surlignée ; convention pièce 1 en bleu, pièce 2 en rouge.
2. **Degrés de liberté** : un bloc en 3D isométrique que l'on fait bouger selon Tx, Ty, Tz, Rx, Ry, Rz ;
   tableau des mobilités et exemple résolu (porte : pivot d'axe z).
3. **Liaisons élémentaires** : le tableau plan / cylindre / sphère du cours, cliquable (contact, liaison, ddl).
4. **Les 11 liaisons** : explorateur — choix de l'axe (x, y, z), tableau des mobilités, mode « je remplis le
   tableau » corrigé case par case, représentations planes redessinées en SVG et animées, représentation en
   perspective et exemple 3D du cours.
5. **Tableau récapitulatif** filtrable par nombre de ddl (imprimable).
6. **Jeu « Quelle liaison ? »** : 10 manches (tableau des mobilités ou schéma normalisé), score et étoiles.
7. **Quiz** de 8 questions corrigé aussitôt.

Choix et compléments par rapport au cours d'origine :
- Les représentations planes sont redessinées (traits nets, animables) ; les représentations en perspective et
  les exemples 3D sont les images du cours.
- Orientation des exemples : axe x pour pivot, pivot glissant, glissière, hélicoïdale et linéaire annulaire ;
  normale z pour appui plan, ponctuelle et linéaire rectiligne (ligne de contact suivant x) ; rotule à doigt :
  rotation Rz bloquée.
- Ajouts : exemples de la vie courante pour chaque liaison, exemple résolu de la porte, jeu et quiz.

## Exercice 1.1 — Degrés de liberté

Une seule carte sur l'accueil, puis le choix de la série (application, révision, évaluation) et du mode. Les séries
utilisent le moteur de l'exercice 2.1 : onglets numérotés des études, photo à gauche, tableau des mobilités cliquable,
nombre de ddl, nom et axe de la liaison, correction rédigée d'origine, bilan par étude. Mode examen : chronomètre,
réponses modifiables, correction et note à la remise de la copie. Les énoncés, réponses et corrections ont été extraits
une fois des anciennes pages par `src/exercices/extraire_series.py` vers `src/exercices/series.json` (photos dans
`src/images/series/`). Changement : l'axe de la liaison est désormais demandé (1 point), comme dans l'exercice 2.1.

## Exercice 2.1 — toutes les liaisons d'un système réel

Une page par système (éolienne, support de smartphone, imprimante 3D, grue de tournage). Pour chaque liaison :
tableau des mobilités cliquable, nom et axe, puis (une fois 1 et 2 validées) choix du schéma parmi 4 ; le mouvement
est rejoué sur la photo, la note sur 20 se met à jour et le bilan trace le graphe des liaisons à partir des réponses.

**Ajouter un système** : déposer la photo dans `src/images/`, puis décrire dans `src/exercices/systemes.py` ses zones
(chemins SVG en pixels de la photo), ses études et son graphe ; la page et sa carte d'accueil sont générées.

## Régénérer

```sh
python3 src/generer.py   # écrit index.html, le cours 1.1 et les pages « en cours d'édition » (Node requis)
```

La charte (bloc de style des exercices d'origine) est dans `src/charte.css`.

## Tester

```sh
NODE_PATH=$(npm root -g) node --test tests/cours.test.js   # accueil, cours 1.1, exercices 2.1 (20/20 sur chaque système), mobile
```

## Organisation

| Chemin | Rôle |
|---|---|
| `src/generer.py` | catalogue des cours et exercices, accueil, cours 1.1, assemblage |
| `src/cours/schemas.js` | représentations planes normalisées des 11 liaisons (SVG) |
| `src/cours/liaisons.js` | moteur du cours : bloc 3D, explorateur, récapitulatif, jeu, quiz |
| `src/exercices/systemes.py` | données des systèmes de l'exercice 2.1 |
| `src/exercices/systeme.js`, `systeme.css` | moteur et styles de l'exercice 2.1 |
| `src/cours/cours.css` | styles de l'accueil et du cours (en plus de la charte) |
| `src/images/originaux/` | images extraites du cours PDF |
| `src/images/` | images recadrées intégrées en data URI |
| `tests/cours.test.js` | parcours Playwright |
