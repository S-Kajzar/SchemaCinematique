# Liaisons mécaniques et schéma cinématique : cours et exercices interactifs

Pages autonomes (un fichier HTML par page, aucune dépendance externe, utilisables hors ligne), publiées par
GitHub Pages. L'accueil reprend la construction du dépôt RDM : une grille « Les cours » et une grille
« Les exercices », avec les pastilles **Niveau 1** (vert) et **Niveau 2** (bleu).

| Page | Contenu |
|---|---|
| `index.html` | accueil : grille des cours, grille des exercices |
| `cours-1-1-liaisons-mecaniques.html` | Cours 1.1 — Les liaisons mécaniques (Niveau 1), interactif |
| `cours-1-2-…`, `cours-2-1-…`, `cours-2-2-…` | cours 1.2 (Niveau 2), 2.1 et 2.2 (schéma cinématique) — « En cours d'édition » |
| `exercice-1-degres-de-liberte-serie-1.html` … `serie-3.html` | Exercice 1.1 — Degrés de liberté (Niveau 1), séries 1 à 3 (inchangées) |

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

## Régénérer

```sh
python3 src/generer.py   # écrit index.html, le cours 1.1 et les pages « en cours d'édition » (Node requis)
```

La charte (bloc de style) est lue dans la page d'exercice de la série 1, pour rester identique aux exercices.

## Tester

```sh
NODE_PATH=$(npm root -g) node --test tests/cours.test.js   # accueil, cours 1.1, jeu, quiz, mobile
```

## Organisation

| Chemin | Rôle |
|---|---|
| `src/generer.py` | catalogue des cours et exercices, accueil, cours 1.1, assemblage |
| `src/cours/schemas.js` | représentations planes normalisées des 11 liaisons (SVG) |
| `src/cours/liaisons.js` | moteur du cours : bloc 3D, explorateur, récapitulatif, jeu, quiz |
| `src/cours/cours.css` | styles de l'accueil et du cours (en plus de la charte) |
| `src/images/originaux/` | images extraites du cours PDF |
| `src/images/` | images recadrées intégrées en data URI |
| `tests/cours.test.js` | parcours Playwright |
