#!/usr/bin/env python3
"""Génère l'accueil (index.html), le cours 1.1 interactif et les pages « en cours d'édition ».

Construction reprise du dépôt RDM : une charte unique (le bloc de style du gabarit des exercices,
recopié sans modification), un accueil en deux grilles (« Les cours », « Les exercices ») avec les
pastilles Niveau 1 / Niveau 2, et des cours interactifs autonomes (aucune dépendance externe).

    python3 src/generer.py
"""
import base64
import html
import json
import pathlib
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent / "exercices"))
from systemes import SYSTEMES  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
IMAGES = SRC / "images"
COURS_DIR = SRC / "cours"
TITRE = "Liaisons mécaniques et schéma cinématique"


def esc(s):
    return html.escape(s, quote=True)


def data_uri(name):
    p = IMAGES / name
    mime = "image/jpeg" if p.suffix == ".jpg" else "image/png"
    return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode()


def charte():
    """Bloc de style du gabarit des exercices d'origine (src/charte.css)."""
    return "<style>" + (SRC / "charte.css").read_text(encoding="utf-8") + "</style>"


def schemas():
    """Exécute schemas.js avec Node pour obtenir les SVG des représentations planes (accueil, tests)."""
    js = (COURS_DIR / "schemas.js").read_text(encoding="utf-8")
    out = subprocess.run(["node", "-e", js + "\nprocess.stdout.write(JSON.stringify(SCHEMAS));"],
                         check=True, capture_output=True, text=True).stdout
    return json.loads(out)


HOUSE = ('<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.3" '
         'stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/>'
         '<path d="M10 20v-5.5h4V20"/></svg>')


def pastille(level):
    if not level:
        return ""
    return f' <span class="pastille n{level.split()[-1]}">{level}</span>'


def page(title, desc, body, body_cls, extra_css="", scripts=""):
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
{charte()}
<style>
{(COURS_DIR / "cours.css").read_text(encoding="utf-8")}{extra_css}
</style>
</head>
<body class="no-mode {body_cls}">
<section id="home" aria-labelledby="home-title"><div class="home-inner">
{body}
</div></section>
{scripts}
</body>
</html>
"""


# ============================================================ catalogue : cours et exercices
COURS = [
    {"file": "cours-1-1-liaisons-mecaniques.html", "tag": "Cours 1.1", "level": "Niveau 1", "title": "Les liaisons mécaniques",
     "ready": True,
     "desc": "Degrés de liberté, liaisons élémentaires et les 11 liaisons normalisées ; avec un bloc à faire bouger, "
             "des schémas animés, un jeu et un quiz."},
    {"file": "cours-1-2-liaisons-mecaniques.html", "tag": "Cours 1.2", "level": "Niveau 2", "title": "Les liaisons mécaniques",
     "ready": False, "desc": "Liaisons et surfaces de contact, orientation des liaisons, liaisons en série et en parallèle."},
    {"file": "cours-2-1-schema-cinematique.html", "tag": "Cours 2.1", "level": "Niveau 1", "title": "Le schéma cinématique",
     "ready": False, "desc": "Classes d'équivalence, graphe des liaisons et premier schéma cinématique."},
    {"file": "cours-2-2-schema-cinematique.html", "tag": "Cours 2.2", "level": "Niveau 2", "title": "Le schéma cinématique",
     "ready": False, "desc": "Schéma cinématique minimal, lecture d'un mécanisme réel, mouvements et trajectoires."},
]

SERIES = json.loads((SRC / "exercices" / "series.json").read_text(encoding="utf-8"))
SERIES_TXT = {
    1: ("Application", "Douze systèmes du quotidien, du tiroir à l'étau de moto."),
    2: ("Révision", "Douze nouveaux systèmes, avec deux cas particuliers : un pied à coulisse dont on serre la vis, "
                    "et un extracteur à deux liaisons."),
    3: ("Évaluation", "Douze systèmes pour faire le point, de la plaque d'immatriculation au touret à meuler ; "
                      "à traiter de préférence en mode examen."),
}


def serie_file(n):
    return f"exercice-1-degres-de-liberte-serie-{n}.html"


def serie_stats(se):
    et = sum(len(x["etudes"]) for x in se["systemes"])
    return len(se["systemes"]), et, sum(x["minutes"] for x in se["systemes"])


EXERCICES = [
    {"file": "exercice-1-degres-de-liberte.html", "tag": "Exercice 1.1", "level": "Niveau 1", "sys": True, "btn": "Choisir une série",
     "title": "Degrés de liberté", "img": "serie-1.jpg",
     "meta": f"3 séries · {sum(serie_stats(se)[1] for se in SERIES)} études",
     "desc": "Trente-six systèmes du quotidien, du tiroir à l'étau : tableau des mobilités, nombre de degrés de liberté, "
             "nom et axe de la liaison. Trois séries : application, révision, évaluation."},
] + [
    {"file": f"exercice-2-{x['slug']}.html", "tag": f"Exercice 2.1 · Système {x['num']}", "level": "Niveau 1", "sys": True,
     "title": x["titre"], "img": f"vignette-{x['slug']}.jpg",
     "meta": f"{len(x['etudes'])} études · {9 * len(x['etudes'])} questions", "desc": x["card"]}
    for x in SYSTEMES
] + [
    {"file": None, "tag": "Exercice 1.2", "level": "Niveau 2", "title": "Liaisons mécaniques",
     "desc": "Surfaces de contact, orientation des liaisons et liaisons équivalentes."},

]


# ============================================================ accueil
def render_hub(sch):
    hero_ids = [("pivot", 0), ("glissiere", 0), ("rotule", 0), ("appui-plan", 0), ("ponctuelle", 1), ("helicoidale", 0)]
    hero = "".join(f'<div>{sch[k][v]["svg"]}</div>' for k, v in hero_ids)
    cours = "".join(
        f'<article class="mode-card cours-card{"" if c["ready"] else " en-edition"}"><div class="mc-head">'
        f'<span class="mc-tag">{c["tag"]}{pastille(c["level"])}</span><h3>{c["title"]}</h3></div>'
        f'<p>{c["desc"]}</p>'
        + ('<p class="small ex-meta">Disponible</p>' if c["ready"] else '<p class="small ex-meta etat">En cours d\'édition</p>')
        + f'<a class="btn{"" if c["ready"] else " ghost"}" href="{c["file"]}">{"Lire le cours" if c["ready"] else "Voir"}</a></article>'
        for c in COURS)
    exos = []
    for e in EXERCICES:
        if e.get("sys"):
            exos.append(
                f'<article class="mode-card ex-card"><img src="{data_uri(e["img"])}" alt="">'
                f'<div class="mc-head"><span class="mc-tag">{e["tag"]}{pastille(e["level"])}</span><h3>{e["title"]}</h3></div>'
                f'<p>{e["desc"]}</p><p class="small ex-meta">{e["meta"]}</p><div class="ex-btns">'
                f'<a class="btn" href="{e["file"]}">{e.get("btn", "Commencer")}</a></div></article>')
        elif e["file"]:
            exos.append(
                f'<article class="mode-card ex-card"><img src="{data_uri(e["img"])}" alt="" width="360" height="260">'
                f'<div class="mc-head"><span class="mc-tag">{e["tag"]}{pastille(e["level"])}</span><h3>{e["title"]}</h3></div>'
                f'<p>{e["desc"]}</p><p class="small ex-meta">{e["meta"]}</p><div class="ex-btns">'
                f'<a class="btn" href="{e["file"]}#entrainement" aria-label="{esc(e["tag"])}, mode entraînement">Entraînement</a>'
                f'<a class="btn btn-ex" href="{e["file"]}#examen" aria-label="{esc(e["tag"])}, mode examen">Examen</a></div></article>')
        else:
            exos.append(
                f'<article class="mode-card en-edition"><div class="mc-head"><span class="mc-tag">{e["tag"]}{pastille(e["level"])}'
                f'</span><h3>{e["title"]}</h3></div><p>{e["desc"]}</p><p class="small ex-meta etat">En cours d\'édition</p></article>')
    body = (f'<div class="home-top"><div class="home-top-l"><header class="home-head"><h1 id="home-title">{TITRE}</h1>'
            '<p class="home-sub">Repérer les mouvements possibles entre deux pièces, nommer les liaisons et '
            'représenter un mécanisme par son schéma cinématique. Des cours et des exercices interactifs de deux '
            'niveaux, à faire en mode entraînement ou en mode examen.</p></header></div>'
            '<figure class="home-hero"><div class="hero-grid" role="img" '
            'aria-label="Six représentations normalisées : pivot, glissière, rotule, appui plan, ponctuelle, hélicoïdale">'
            f'{hero}</div><figcaption class="small">Quelques liaisons normalisées : pièce 1 en bleu, pièce 2 en rouge.'
            '</figcaption></figure></div>'
            f'<h2 class="home-choose">Les cours</h2><div class="ex-grid cours-grid">{cours}</div>'
            f'<h2 class="home-choose">Les exercices</h2><div class="ex-grid">{"".join(exos)}</div>'
            f'<p class="home-note small">Pastilles : {pastille("Niveau 1").strip()} premier niveau, '
            f'{pastille("Niveau 2").strip()} niveau approfondi. Chaque exercice propose le mode entraînement (chaque étude '
            'se valide seule, correction aussitôt) ou le mode examen (aucune correction pendant la composition, tout est '
            'dévoilé à la remise de la copie). Les pages fonctionnent hors ligne ; rien n\'est enregistré sur l\'ordinateur.</p>')
    return page(TITRE + " — cours et exercices interactifs",
                "Cours et exercices interactifs sur les liaisons mécaniques : degrés de liberté, nom des liaisons, "
                "schéma cinématique.", body, "hub")


def render_en_edition(c):
    body = (f'<div class="home-top home-top-single"><div class="home-top-l"><header class="home-head">'
            f'<span class="mc-tag">{c["tag"]}</span>{pastille(c["level"])}<h1 id="home-title">{c["title"]}</h1>'
            '<p class="home-sub">Ce cours est en cours d\'édition : il sera mis en ligne prochainement.</p>'
            '</header></div></div>'
            '<section class="hub-course" aria-labelledby="ec-t"><div><h2 id="ec-t">En cours d\'édition</h2>'
            f'<p>{c["desc"]}</p></div>'
            f'<div class="hub-btns"><a class="btn" href="index.html">{HOUSE} Retour à l\'accueil</a></div></section>')
    return page(f'{c["tag"]} — {c["title"]} (en cours d\'édition)', c["desc"], body, "cours-page")


# ============================================================ cours 1.1 — les liaisons mécaniques (niveau 1)
VOLUMES = [  # (ligne, colonne, liaison, image, contact)
    ("Plan", "Plan", "appui-plan", "ve-plan-plan.png", "Plan sur plan · contact selon une surface plane"),
    ("Plan", "Cylindre", "lineaire-rectiligne", "ve-plan-cylindre.png", "Cylindre sur plan · contact selon une ligne droite"),
    ("Plan", "Sphère", "ponctuelle", "ve-plan-sphere.png", "Sphère sur plan · contact en un point"),
    ("Cylindre", "Cylindre", "pivot-glissant", "ve-cylindre-cylindre.png", "Cylindre dans cylindre · contact selon une surface cylindrique"),
    ("Cylindre", "Sphère", "lineaire-annulaire", "ve-cylindre-sphere.png", "Sphère dans cylindre · contact selon un cercle"),
    ("Sphère", "Sphère", "rotule", "ve-sphere-sphere.png", "Sphère dans sphère · contact selon une surface sphérique"),
]
VE_NOMS = {"appui-plan": "Appui plan", "lineaire-rectiligne": "Linéaire rectiligne", "ponctuelle": "Ponctuelle",
           "pivot-glissant": "Pivot glissant", "lineaire-annulaire": "Linéaire annulaire", "rotule": "Sphérique ou rotule"}

QUIZ = [
    ("Combien existe-t-il de mouvements élémentaires entre deux pièces ?",
     ["6 : 3 translations et 3 rotations", "3 : Tx, Ty et Tz", "11", "12"], 0,
     "Trois translations (Tx, Ty, Tz) et trois rotations (Rx, Ry, Rz) : 6 mouvements élémentaires."),
    ("Une liaison pivot d'axe x autorise…", ["seulement Rx", "seulement Tx", "Tx et Rx", "aucun mouvement"], 0,
     "Le pivot n'a qu'un degré de liberté : la rotation autour de son axe."),
    ("Quelle liaison n'a aucun degré de liberté ?", ["L'encastrement", "La rotule", "La ponctuelle", "Le pivot"], 0,
     "Encastrement (ou liaison fixe) : 0 ddl, les deux pièces forment un seul bloc."),
    ("Une sphère posée sur un plan forme une liaison…",
     ["ponctuelle", "rotule", "appui plan", "linéaire annulaire"], 0,
     "Contact sphère-plan : un point. C'est la liaison ponctuelle (5 ddl)."),
    ("Un tiroir dans un meuble est une liaison…", ["glissière", "pivot glissant", "pivot", "appui plan"], 0,
     "Le tiroir ne peut que coulisser : une seule translation, c'est une glissière."),
    ("Quelle liaison possède le plus de degrés de liberté ?",
     ["La ponctuelle (5 ddl)", "La rotule (3 ddl)", "La linéaire rectiligne (4 ddl)", "L'appui plan (3 ddl)"], 0,
     "La ponctuelle n'interdit qu'un mouvement : s'enfoncer dans le plan (ou s'en décoller)."),
    ("Dans une liaison hélicoïdale (vis-écrou), la translation et la rotation sont…",
     ["liées : 1 seul degré de liberté", "indépendantes : 2 degrés de liberté", "toutes les deux impossibles"], 0,
     "La vis avance quand elle tourne : un seul mouvement, donc 1 ddl."),
    ("Tableau : Tx = 1 et Rx = 1, indépendants ; tous les autres à 0. C'est une liaison…",
     ["pivot glissant d'axe x", "glissière d'axe x", "pivot d'axe x", "rotule"], 0,
     "Une translation et une rotation suivant le même axe, indépendantes : pivot glissant (2 ddl)."),
]

DEF_SVG = """<svg id="def-svg" viewBox="0 0 300 200" role="img" aria-label="Un arbre rouge (pièce 2) tourne dans un support bleu (pièce 1) ; la zone de contact est surlignée en jaune">
<path d="M40 182 H260" stroke="#1C2530" stroke-width="2"/><path d="M50 182 l-10 12 M80 182 l-10 12 M110 182 l-10 12 M140 182 l-10 12 M170 182 l-10 12 M200 182 l-10 12 M230 182 l-10 12 M260 182 l-10 12" stroke="#1C2530" stroke-width="1.2"/>
<path d="M80 182 V95 A70 70 0 0 1 220 95 V182 Z" fill="#D7E7F6" stroke="var(--p1)" stroke-width="3"/>
<circle cx="150" cy="110" r="36" fill="#fff" stroke="var(--p1)" stroke-width="3"/>
<circle class="contact" cx="150" cy="110" r="34"/>
<g class="def-2"><circle cx="150" cy="110" r="31" fill="#F8D4CC" stroke="var(--p2)" stroke-width="3"/>
<path d="M150 110 L150 34" stroke="var(--p2)" stroke-width="9" stroke-linecap="round"/><circle cx="150" cy="34" r="10" fill="var(--p2)"/>
<circle cx="150" cy="110" r="6" fill="var(--p2)"/></g>
<text x="96" y="170" font-weight="700" font-size="18" fill="var(--p1)">1</text><text x="192" y="76" font-weight="700" font-size="18" fill="var(--p2)">2</text>
</svg>"""


def mob_static(mob):
    m = ["Tx", "Ty", "Tz", "Rx", "Ry", "Rz"]
    return ('<table class="mob"><thead><tr><th colspan="3">Translation</th><th colspan="3">Rotation</th></tr><tr>'
            + "".join(f"<th>{x}</th>" for x in m) + "</tr></thead><tbody><tr>"
            + "".join(f'<td class="v{v}">{v}</td>' for v in mob) + "</tr></tbody></table>")


def render_cours_liaisons():
    imgs = {p.stem: data_uri(p.name) for p in sorted(IMAGES.glob("ex-*.png"))}
    imgs.update({p.stem: data_uri(p.name) for p in sorted(IMAGES.glob("persp-*.png"))})
    cols = ["Plan", "Cylindre", "Sphère"]
    grid = ['<div class="ve-h" aria-hidden="true"></div>'] + [f'<div class="ve-h">{c.upper()}</div>' for c in cols]
    for r in cols:
        grid.append(f'<div class="ve-h">{r.upper()}</div>')
        for c in cols:
            v = next((x for x in VOLUMES if x[0] == r and x[1] == c), None)
            if v:
                grid.append(f'<button type="button" class="ve-cell" data-l="{v[2]}" data-c="{esc(v[4])}" aria-pressed="false">'
                            f'<img src="{data_uri(v[3])}" alt="{esc(v[4])}">{VE_NOMS[v[2]]}</button>')
            else:
                grid.append('<div class="ve-x" title="Case symétrique : déjà présente dans le tableau"></div>')
    quiz = []
    for i, (q, opts, ok, why) in enumerate(QUIZ):
        # la bonne réponse change de place d'une question à l'autre (ordre fixe, reproductible)
        r = (i * 3 + 1) % len(opts)
        order = list(range(len(opts)))[r:] + list(range(len(opts)))[:r]
        quiz.append(
            f'<fieldset class="quiz-q" data-ok="{order.index(ok)}"><legend><span class="q-num">{i + 1}</span> {q}</legend>'
            + "".join(f'<label><input type="radio" name="qz{i}" value="{j}"> {opts[o]}</label>' for j, o in enumerate(order))
            + f'<p class="quiz-fb" aria-live="polite"></p><p class="quiz-why" hidden>{why}</p></fieldset>')
    quiz = "".join(quiz)
    secs = [("c-def", "Définition"), ("c-ddl", "Degrés de liberté"), ("c-elem", "Liaisons élémentaires"),
            ("c-liaisons", "Les 11 liaisons"), ("c-recap", "Tableau récapitulatif"), ("c-jeu", "Jeu"), ("c-quiz", "Quiz")]
    nav = "".join(f'<a href="#{a}">{n}. {t}</a>' for n, (a, t) in enumerate(secs, 1))

    def head(n, a, t):
        return (f'<section class="part cours-sec" id="{a}" aria-labelledby="{a}-t"><header class="part-head">'
                f'<div class="part-num" aria-hidden="true">{n}</div><div><h2 id="{a}-t">{t}</h2></div></header>'
                '<div class="part-body">')

    filt = "".join(f'<button type="button" data-f="{f}" aria-pressed="{"true" if f == "all" else "false"}">{t}</button>'
                   for f, t in [("all", "Toutes")] + [(str(i), f"{i} ddl") for i in range(6)])
    body = f"""<div class="cours" id="cours-liaisons">
<p class="c-top no-print"><a class="btn ghost" href="index.html">{HOUSE} Accueil</a></p>
<div class="home-top home-top-single"><div class="home-top-l"><header class="home-head"><span class="mc-tag">Cours 1.1</span>{pastille("Niveau 1")}
<h1 id="home-title">Les liaisons mécaniques</h1><p class="home-sub">Repérer les mouvements possibles entre deux pièces,
compter les degrés de liberté et reconnaître les 11 liaisons normalisées. Environ 30 minutes : fais bouger le bloc,
explore les liaisons et leurs schémas animés, puis teste-toi avec le jeu et le quiz.</p></header></div></div>
<p class="objectif">Objectif : étudier le fonctionnement d'un mécanisme.</p>
<nav class="cours-nav" aria-label="Étapes du cours">{nav}</nav>

{head(1, "c-def", "Définition")}
<div class="cours-split"><div>
<p>Dans un mécanisme, quand une pièce est <strong>en contact</strong> avec une autre, il y a entre ces deux pièces une
<strong>liaison mécanique</strong>.</p>
<p>Ici, l'arbre <b style="color:var(--p2)">2</b> est en contact avec le support <b style="color:var(--p1)">1</b> (zone jaune) :
cette liaison lui permet de tourner, mais l'empêche de sortir de son logement.</p>
<div class="retenir"><p><strong>À retenir :</strong> une liaison relie <strong>deux pièces</strong> en contact ; elle autorise
certains mouvements et en interdit d'autres.</p></div>
<p class="legende-pieces"><span class="l1">pièce 1 (le support, fixe)</span><span class="l2">pièce 2 (la pièce qui bouge)</span></p>
<p class="small">Cette couleur est utilisée dans tous les schémas du cours.</p>
<p><button type="button" class="btn ghost" id="def-play">▶ Faire tourner la pièce 2</button></p>
</div><figure class="fig" style="margin:0">{DEF_SVG}</figure></div>
</div></section>

{head(2, "c-ddl", "Degrés de liberté")}
<p>La liaison entre deux pièces se caractérise par le <strong>nombre de mobilités</strong> que peut avoir l'une des pièces
par rapport à l'autre. Ces mobilités (ou mouvements autorisés) sont appelées <strong>degrés de liberté</strong> (ddl).</p>
<p>Ils correspondent aux <strong>6 mouvements élémentaires</strong> : <strong>3 translations</strong> T<sub>x</sub>, T<sub>y</sub>,
T<sub>z</sub> (glisser le long d'un axe) et <strong>3 rotations</strong> R<sub>x</sub>, R<sub>y</sub>, R<sub>z</sub> (tourner autour d'un axe).</p>
<p class="cours-defi">À toi : clique sur chaque mouvement pour voir le bloc bouger dans le repère.</p>
<div class="cube-wrap"><div id="cube"></div><div>
<div class="cube-btns" role="group" aria-label="Les six mouvements élémentaires"><span>3 translations</span>
<button type="button" data-m="Tx" aria-pressed="false">Tx</button><button type="button" data-m="Ty" aria-pressed="false">Ty</button><button type="button" data-m="Tz" aria-pressed="false">Tz</button>
<span>3 rotations</span>
<button type="button" data-m="Rx" aria-pressed="false">Rx</button><button type="button" data-m="Ry" aria-pressed="false">Ry</button><button type="button" data-m="Rz" aria-pressed="false">Rz</button></div>
<p id="cube-txt" aria-live="polite">Choisis un mouvement. Le pointillé montre la position de départ ; la face jaune aide à suivre les rotations.</p>
</div></div>
<h3>Le tableau des mobilités</h3>
<p>Pour décrire une liaison, on remplit un tableau : <strong>1</strong> si le mouvement est possible, <strong>0</strong> s'il
est impossible. Le <strong>nombre de degrés de liberté</strong> est le nombre de « 1 ».</p>
<p><strong>Exemple :</strong> une porte par rapport au mur ne peut que tourner autour de l'axe vertical z de ses gonds.</p>
{mob_static([0, 0, 0, 0, 0, 1])}
<p>Nombre de ddl : <strong>1</strong>. C'est une liaison <strong>pivot d'axe z</strong>.</p>
<div class="retenir"><p><strong>À retenir :</strong> de 0 ddl (les pièces sont bloquées l'une sur l'autre) à 6 ddl (aucun
contact : les pièces sont libres).</p></div>
</div></section>

{head(3, "c-elem", "Liaisons élémentaires")}
<p>À partir des trois volumes élémentaires, <strong>plan, cylindre et sphère</strong>, on peut définir toutes les combinaisons
de contact possibles.</p>
<p class="cours-defi">À toi : clique sur une case pour découvrir le contact et la liaison obtenue.</p>
<div class="ve"><div class="ve-grid">{"".join(grid)}</div>
<div id="ve-out" aria-live="polite"><p>Choisis une case du tableau. Les cases barrées sont symétriques : un cylindre sur un plan,
c'est la même chose qu'un plan sur un cylindre.</p></div></div>
</div></section>

{head(4, "c-liaisons", "Les 11 liaisons normalisées")}
<p>Il existe <strong>11 liaisons mécaniques</strong> à partir desquelles il est possible de décrire tous les mouvements
possibles d'un système mécanique. Ces liaisons « normalisées » ont chacune une représentation plane et une représentation en
perspective.</p>
<p class="cours-defi">À toi : choisis une liaison, change son axe, anime son schéma, puis remplis toi-même son tableau.</p>
<div class="lx"><div id="lx-list" role="tablist" aria-label="Les 11 liaisons"></div><div id="lx-card" role="tabpanel" aria-live="polite"></div></div>
</div></section>

{head(5, "c-recap", "Tableau récapitulatif")}
<p>Les 11 liaisons, classées comme dans le cours. Filtre-les par nombre de degrés de liberté.</p>
<div class="rc-filter no-print" role="group" aria-label="Filtrer par nombre de degrés de liberté">{filt}</div>
<div class="recap-wrap"><table class="recap"><thead><tr><th>Liaison</th><th>ddl</th><th>Translations</th><th>Rotations</th>
<th>Représentations planes</th><th>Exemple</th><th class="no-print"></th></tr></thead><tbody id="recap-body"></tbody></table></div>
<p class="small">Hélicoïdale : une translation et une rotation, mais <strong>combinées</strong> (la vis avance en tournant) : 1 seul ddl.</p>
</div></section>

{head(6, "c-jeu", "Jeu : quelle liaison ?")}
<p>Dix manches : un tableau des mobilités ou un schéma normalisé s'affiche, retrouve la liaison.</p>
<div class="jeu"><div class="jeu-bar" aria-hidden="true"><div id="jeu-prog"></div></div>
<div id="jeu-play"><p id="jeu-num"></p><div id="jeu-q"></div><div id="jeu-opts"></div>
<p class="jeu-fb" id="jeu-fb" aria-live="polite"></p><button type="button" class="btn" id="jeu-next" hidden>Manche suivante →</button></div>
<div id="jeu-end" hidden><p>Score final</p><p id="jeu-score"></p><span id="jeu-stars" aria-hidden="true"></span><p id="jeu-msg"></p>
<button type="button" class="btn" id="jeu-again">Rejouer</button></div></div>
</div></section>

{head(7, "c-quiz", "Quiz : vérifie tes connaissances")}
<p>Choisis une réponse : la correction s'affiche aussitôt.</p>
<div class="quiz">{quiz}</div>
<div class="quiz-score" aria-live="polite"><span id="qz-score">0 / {len(QUIZ)}</span><span id="qz-stars" aria-hidden="true"></span>
<button type="button" class="btn ghost" id="qz-reset">Recommencer</button></div>
</div></section>

<div class="cours-foot no-print"><a class="btn" href="exercice-1-degres-de-liberte-serie-1.html#entrainement">S'entraîner : Exercice 1.1, série 1</a>
<button type="button" class="btn ghost" id="cours-print">Imprimer le cours</button>
<a class="btn ghost" href="index.html">{HOUSE} Retour à l'accueil</a></div>
</div>"""
    scripts = ("<script>window.__IMG__ = " + json.dumps(imgs) + ";</script>\n<script>\n"
               + (COURS_DIR / "schemas.js").read_text(encoding="utf-8") + "\n"
               + (COURS_DIR / "liaisons.js").read_text(encoding="utf-8") + "</script>")
    return page("Cours 1.1 — Les liaisons mécaniques (niveau 1)",
                "Cours interactif : degrés de liberté, liaisons élémentaires et les 11 liaisons normalisées, "
                "avec schémas animés, jeu et quiz.", body, "cours-page", scripts=scripts)


# ============================================================ exercice 2.1 — toutes les liaisons d'un système réel
MODES = """<section id="modes" aria-labelledby="modes-t"><h2 class="home-choose" id="modes-t">Choisis ton mode de travail</h2><div class="modes">
<article class="mode-card"><div class="mc-head"><span class="mc-tag">Mode 1</span><h3>Entraînement</h3></div>
<ul><li>Chaque étude se valide seule : la correction s'affiche aussitôt.</li><li>La note s'actualise au fil des études.</li></ul>
<button type="button" class="btn" data-mode="training">Commencer l'entraînement</button></article>
<article class="mode-card exam"><div class="mc-head"><span class="mc-tag">Mode 2</span><h3>Examen</h3></div>
<ul><li>Aucune correction pendant la composition ; les réponses restent modifiables.</li><li>Chronomètre en marche ; tout est dévoilé à la remise de la copie.</li></ul>
<button type="button" class="btn" data-mode="exam">Composer en mode examen</button></article></div>
<p class="home-note small">Pour changer de mode, recharge la page. Rien n'est enregistré sur l'ordinateur.</p></section>"""


def render_etudes(data, tag, titre, sub, back, title, desc):
    """Page d'exercice commune : en-tête, choix du mode, onglets des études, photo et panneau de questions."""
    body = f"""<p class="c-top no-print"><a class="btn ghost" href="{back[0]}">{HOUSE} {back[1]}</a></p>
<div class="home-top home-top-single"><div class="home-top-l"><header class="home-head"><span class="mc-tag">{tag}</span>{pastille("Niveau 1")}
<h1 id="home-title">{titre}</h1><p class="home-sub">{sub}</p></header></div></div>
{MODES}
<div id="travail" hidden><p class="mode-bar"><span id="mode-lab"></span> <a class="small" href="cours-1-1-liaisons-mecaniques.html" target="_blank" rel="noopener">Revoir le cours (nouvel onglet)</a></p>
<nav id="tabs" class="eo-tabs" role="tablist" aria-label="Études"></nav>
<div class="eo"><div class="eo-fig"><div class="eo-img"><img id="fig-img" src="" alt="">
<svg id="ov" aria-hidden="true"><g id="ov-static"></g><g id="ov-move"></g></svg><div id="fig-rep"></div></div>
<div class="eo-score"><div><span>Questions traitées</span><b id="sc-q"></b></div><div><span>Note</span><b id="sc-n"></b></div>
<div class="sc-t"><span>Temps</span><b id="sc-t"></b></div></div></div>
<div id="etude" class="eo-panel" aria-live="polite"></div></div></div>"""
    scripts = ("<script>window.__SYSTEME__ = " + json.dumps(data, ensure_ascii=False) + ";</script>\n<script>\n"
               + (COURS_DIR / "schemas.js").read_text(encoding="utf-8") + "\n"
               + (SRC / "exercices" / "systeme.js").read_text(encoding="utf-8") + "</script>")
    return page(title, desc, body, "cours-page", extra_css=(SRC / "exercices" / "systeme.css").read_text(encoding="utf-8"), scripts=scripts)


ROUGE_BLEU = " La pièce étudiée est en <b class=\"r\">rouge</b>, la pièce de référence en <b class=\"b\">bleu</b>."


def render_systeme(x):
    data = {"images": {k: {"src": data_uri(v["file"]), "w": v["w"], "h": v["h"], "alt": v["alt"], "rep": v["rep"],
                           "zones": v["zones"]} for k, v in x["images"].items()},
            "etudes": x["etudes"], "graphe": x["graphe"], "retenir": x["retenir"]}
    return render_etudes(data, f"Exercice 2.1 · Système {x['num']}", f"{x['titre']} : étude de toutes ses liaisons",
                         x["intro"] + " Pour chaque liaison : tableau des mobilités, nom et axe, puis schéma." + ROUGE_BLEU,
                         ("index.html", "Accueil"), f"Exercice 2.1 — {x['titre']}",
                         f"Exercice interactif : toutes les liaisons — {x['titre'].lower()}.")


def render_serie(se):
    n = se["num"]
    images, etudes = {}, []
    for k, x in enumerate(se["systemes"]):
        images[f"p{k}"] = {"src": data_uri(x["img"]), "w": x["w"], "h": x["h"], "alt": x["alt"], "rep": None, "zones": {}}
        for e in x["etudes"]:
            titre = e["titre"].replace("Étude du mouvement", "Mouvement").replace("Étude de la liaison", "Liaison")
            etudes.append({"img": f"p{k}", "sys": x["titre"], "titre": titre[0].upper() + titre[1:],
                           "consigne": e["titre"] + ".", "mob": e["mob"], "ddl": e["ddl"], "nom": e["nom"], "axe": e["axe"],
                           "why": e["why"].replace("Dans la fiche C2", "Dans le tableau des liaisons du cours")
                                          .replace("de la fiche C2", "du tableau des liaisons du cours")})
    nsys, net, mins = serie_stats(se)
    nom, _ = SERIES_TXT[n]
    data = {"images": images, "etudes": etudes, "compact": True, "minutes": mins,
            "retour": "exercice-1-degres-de-liberte.html", "retourTxt": "Choisir une autre série"}
    return render_etudes(data, f"Exercice 1.1 · Série {n}", f"Degrés de liberté — série {n} : {nom.lower()}",
                         f"{nsys} systèmes, {net} études, environ {mins} min. Pour chaque étude : tableau des mobilités, "
                         "nombre de degrés de liberté, nom et axe de la liaison. Le repère est indiqué sur chaque photo.",
                         ("exercice-1-degres-de-liberte.html", "Les séries"), f"Exercice 1.1 — Degrés de liberté, série {n}",
                         f"Exercice interactif : degrés de liberté, série {n}.")


def render_series_hub():
    cards = []
    for se in SERIES:
        n = se["num"]; nsys, net, mins = serie_stats(se); nom, txt = SERIES_TXT[n]
        cards.append(f'<article class="mode-card ex-card"><img src="{data_uri(f"serie-{n}.jpg")}" alt="">'
                     f'<div class="mc-head"><span class="mc-tag">Série {n}</span><h3>{nom}</h3></div><p>{txt}</p>'
                     f'<p class="small ex-meta">{nsys} systèmes · {net} études · {mins} min</p><div class="ex-btns">'
                     f'<a class="btn" href="{serie_file(n)}#entrainement">Entraînement</a>'
                     f'<a class="btn btn-ex" href="{serie_file(n)}#examen">Examen</a></div></article>')
    body = (f'<p class="c-top no-print"><a class="btn ghost" href="index.html">{HOUSE} Accueil</a></p>'
            f'<div class="home-top home-top-single"><div class="home-top-l"><header class="home-head"><span class="mc-tag">Exercice 1.1</span>'
            f'{pastille("Niveau 1")}<h1 id="home-title">Degrés de liberté</h1><p class="home-sub">Pour chaque système : repère les '
            'mouvements possibles d\'une pièce par rapport à l\'autre, compte les degrés de liberté, puis nomme la liaison et '
            'son axe. Choisis une série, puis ton mode de travail.</p></header></div></div>'
            f'<h2 class="home-choose">Les séries</h2><div class="ex-grid">{"".join(cards)}</div>'
            '<p class="home-note small">Entraînement : correction après chaque étude. Examen : chronomètre, correction à la '
            'remise de la copie. Besoin d\'un rappel ? <a href="cours-1-1-liaisons-mecaniques.html">Cours 1.1 — Les liaisons mécaniques</a>.</p>')
    return page("Exercice 1.1 — Degrés de liberté", "Exercice interactif sur les degrés de liberté : trois séries.", body, "hub")


def build():
    sch = schemas()
    out = {"index.html": render_hub(sch), COURS[0]["file"]: render_cours_liaisons(),
           **{f"exercice-2-{x['slug']}.html": render_systeme(x) for x in SYSTEMES},
           "exercice-1-degres-de-liberte.html": render_series_hub(),
           **{serie_file(se["num"]): render_serie(se) for se in SERIES}}
    for c in COURS[1:]:
        out[c["file"]] = render_en_edition(c)
    for name, text in out.items():
        (ROOT / name).write_text(text, encoding="utf-8")
        print(f"{name} : {len(text.encode()) // 1024} Kio")


if __name__ == "__main__":
    build()
