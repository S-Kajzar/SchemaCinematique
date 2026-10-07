"""Données de l'exercice 2.1 : un système réel par page, toutes ses liaisons étudiées.

Pour chaque système :
- images : photo (fichier de src/images), dimensions, repère affiché, zones (chemins SVG en pixels de la photo) ;
- etudes : pièce rouge R (étudiée) et bleue B (référence) sous forme de listes de zones, mobilités attendues
  (Tx Ty Tz Rx Ry Rz), nom et axe ("-" : sans axe), animation rejouée sur la photo, et 4 schémas proposés
  [liaison, vue, rotation en degrés, juste?] tirés de src/cours/schemas.js ;
- graphe : position des pièces et liaisons du bilan [pièce, pièce, numéro d'étude].
"""

REP_XY = {"label": "Repère : x vers la droite, y vers le haut, z vers l'observateur",
          "axes": [["x", 45, 0], ["y", 0, -45], ["z", 0, 0]]}
REP_IMP = {"label": "Repère : x le long de la poutre, y vers l'avant, z vers le haut",
           "axes": [["x", 46, 5], ["y", -17, 17], ["z", 0, -45]], "pos": "tl"}

SYSTEMES = [
    {
        "slug": "eolienne", "num": 1, "titre": "L'éolienne",
        "card": "Rotor, nacelle, pales, mât, fondation : une éolienne vue de face, de la pale au massif de béton.",
        "intro": "Une éolienne transforme l'énergie du vent en électricité. On étudie toutes ses liaisons, de la pale à la fondation.",
        "images": {
            "face": {"file": "eolienne.png", "w": 465, "h": 541, "rep": REP_XY,
                     "alt": "Éolienne : pales, nacelle avec générateur, mât et fondation",
                     "zones": {
                         "paleH": "M174 37 Q183 40 182 60 L181 156 L171 159 Q164 120 170 60 Q170 40 174 37Z",
                         "paleB": "M171 231 L181 229 L182 350 Q182 370 176 371 Q168 352 167 300 Z",
                         "moyeu": "M188 186 L152 186 Q131 190 131 204 Q132 219 152 222 L188 222Z",
                         "nacelle": "M192 185 L312 188 Q329 194 328 206 Q325 218 302 221 L250 222 L250 234 L218 234 L218 222 L192 222Z",
                         "mat": "M226 234 L250 234 L250 466 L261 466 L261 495 L226 495Z",
                         "fondation": "M173 493 L298 493 L298 503 L318 503 L318 523 L153 523 L153 503 L173 503Z"}}},
        "etudes": [
            {"titre": "Rotor / nacelle", "img": "face", "R": ["paleH", "paleB", "moyeu"], "B": ["nacelle"],
             "rN": "le rotor (pales + moyeu)", "bN": "la nacelle", "mob": [0, 0, 0, 1, 0, 0], "nom": "Pivot", "axe": "x",
             "anim": {"t": "scaleY", "ox": 160, "oy": 204}, "plan": "(O, x, y)",
             "why": "Le rotor tourne autour de l'arbre horizontal de la nacelle (axe x) : c'est son seul mouvement, le vent fait tourner les pales.",
             "sch": [["pivot", 0, 0, True], ["pivot", 0, 90], ["pivot", 1, 0], ["glissiere", 0, 0]]},
            {"titre": "Nacelle / mât", "img": "face", "R": ["nacelle", "moyeu", "paleH", "paleB"], "B": ["mat"],
             "rN": "la nacelle (avec le rotor)", "bN": "le mât", "mob": [0, 0, 0, 0, 1, 0], "nom": "Pivot", "axe": "y",
             "anim": {"t": "scaleX", "ox": 238, "oy": 230}, "plan": "(O, x, y)",
             "why": "La nacelle s'oriente face au vent en tournant autour de l'axe vertical du mât (axe y).",
             "sch": [["pivot", 0, 0], ["pivot", 0, 90, True], ["pivot", 1, 0], ["pivot-glissant", 0, 90]]},
            {"titre": "Pale / moyeu", "img": "face", "R": ["paleH"], "B": ["moyeu"],
             "rN": "la pale du haut", "bN": "le moyeu", "mob": [0, 0, 0, 0, 1, 0], "nom": "Pivot", "axe": "y",
             "anim": {"t": "scaleX", "ox": 176, "oy": 100}, "plan": "(O, x, y)",
             "why": "Chaque pale tourne sur elle-même pour régler son angle face au vent (le « calage ») : pivot d'axe y pour la pale du haut.",
             "sch": [["rotule", 0, 0], ["pivot", 0, 90, True], ["pivot", 1, 0], ["glissiere", 0, 90]]},
            {"titre": "Mât / fondation", "img": "face", "R": ["mat"], "B": ["fondation"],
             "rN": "le mât", "bN": "la fondation", "mob": [0, 0, 0, 0, 0, 0], "nom": "Encastrement", "axe": "-",
             "anim": None, "plan": "(O, x, y)",
             "why": "Le mât est boulonné sur la fondation en béton : aucun mouvement possible. Mât et fondation forment un seul bloc.",
             "sch": [["encastrement", 0, 0, True], ["rotule", 0, 0], ["appui-plan", 0, 0], ["pivot", 1, 0]]},
        ],
        "graphe": {"w": 460, "h": 250, "nodes": {"fondation": [70, 210, "Fondation"], "mat": [70, 120, "Mât"],
                                                  "nacelle": [230, 50, "Nacelle"], "moyeu": [390, 120, "Moyeu"], "pale": [390, 210, "Pale"]},
                   "edges": [["mat", "fondation", 3], ["nacelle", "mat", 1], ["moyeu", "nacelle", 0], ["pale", "moyeu", 2]]},
        "retenir": "le mât et la fondation sont encastrés : ils ne forment qu'une seule <strong>classe d'équivalence</strong> "
                   "(un seul bloc). L'éolienne se ramène à une chaîne de 3 pivots : orientation de la nacelle (y), rotation du "
                   "rotor (x) et calage de chaque pale.",
    },
    {
        "slug": "support-smartphone", "num": 2, "titre": "Le support de smartphone",
        "card": "Un support à pince pour tableau de bord : pince à mâchoires, vis de serrage et rotule de réglage.",
        "intro": "Ce support se serre sur le tableau de bord ; le téléphone s'oriente grâce à une rotule. Deux photos : le support en voiture, puis le support seul.",
        "images": {
            "voiture": {"file": "support-voiture.jpg", "w": 589, "h": 671, "rep": REP_XY,
                        "alt": "Smartphone tenu par le support, fixé sur le tableau de bord d'une voiture",
                        "zones": {
                            "telephone": "M168 128 Q172 118 238 117 Q276 118 278 132 L273 462 Q268 473 220 473 Q172 471 166 458Z",
                            "griffeG": "M150 243 L170 243 L170 360 L150 360Z",
                            "griffeD": "M250 233 L300 235 L300 365 L250 365Z",
                            "brasV": "M300 288 L360 290 L398 312 L396 342 L300 346Z"}},
            "pince": {"file": "support-pince.jpg", "w": 665, "h": 872, "rep": REP_XY,
                      "alt": "Le support seul : porte-téléphone sur bras à rotule, pince à deux mâchoires et vis de serrage",
                      "zones": {
                          "porte": "M278 18 L655 12 L665 300 L640 330 L295 330 L280 300Z",
                          "bras": "M38 245 Q42 180 110 155 L282 125 L288 232 L150 245 Q128 250 124 270 L120 300 L95 300 L92 268 Q62 262 38 245Z",
                          "rotule": "M36 300 Q50 282 100 286 Q190 280 216 300 L218 378 Q190 392 125 392 Q60 392 38 378Z",
                          "machSup": "M48 382 L215 375 L300 410 L372 420 L425 470 L482 520 L505 580 L492 640 L445 662 L400 650 L396 612 L430 580 L400 520 L340 470 L235 452 L210 498 L100 503 L60 492 L48 440Z",
                          "patinSup": "M6 505 L262 515 L258 562 L8 552Z",
                          "machInf": "M442 598 L500 620 L490 662 L420 692 L370 722 L300 762 L220 792 L150 812 L90 812 L48 782 L44 722 L120 706 L220 716 L300 690 L360 660 L410 640Z",
                          "patinInf": "M4 690 L60 640 L250 650 L248 702 L10 710Z",
                          "vis": "M296 690 L345 690 L345 812 L362 815 L358 870 L262 870 L262 815 L296 812Z"}}},
        "etudes": [
            {"titre": "Téléphone / porte-téléphone", "img": "voiture", "R": ["telephone"], "B": ["griffeG", "griffeD", "brasV"],
             "rN": "le téléphone", "bN": "le porte-téléphone (griffes serrées)", "mob": [0, 0, 0, 0, 0, 0], "nom": "Encastrement", "axe": "-",
             "anim": None, "plan": "(O, x, y)",
             "why": "Les griffes à ressort serrent le téléphone : il ne peut ni glisser ni tourner pendant que la voiture roule.",
             "sch": [["encastrement", 0, 0, True], ["rotule", 0, 0], ["appui-plan", 0, 0], ["glissiere", 0, 90]]},
            {"titre": "Bras / rotule", "img": "pince", "R": ["porte", "bras"], "B": ["rotule"],
             "rN": "le bras porte-téléphone", "bN": "le boîtier de la rotule", "mob": [0, 0, 0, 1, 1, 1], "nom": "Rotule", "axe": "-",
             "note": "(molette desserrée)",
             "anim": {"t": "rotate", "a": 10, "ox": 108, "oy": 282}, "plan": "(O, x, y)",
             "why": "La boule du bras tourne dans son logement : trois rotations autour du centre de la boule, aucune translation. Une fois la molette serrée, la rotule est bloquée.",
             "sch": [["rotule", 0, 0, True], ["rotule-a-doigt", 0, 0], ["pivot", 1, 0], ["lineaire-annulaire", 1, 0]]},
            {"titre": "Mâchoire haute / mâchoire basse", "img": "pince", "R": ["machSup", "patinSup", "rotule"], "B": ["machInf", "patinInf"],
             "rN": "la mâchoire haute (avec la rotule)", "bN": "la mâchoire basse", "mob": [0, 0, 0, 0, 0, 1], "nom": "Pivot", "axe": "z",
             "note": "(vis desserrée)",
             "anim": {"t": "rotate", "a": 7, "ox": 418, "oy": 625}, "plan": "(O, x, y)",
             "why": "Les deux mâchoires sont articulées autour de l'axe visible à droite (rond blanc), perpendiculaire à la photo : pivot d'axe z.",
             "sch": [["pivot", 1, 0, True], ["pivot", 0, 0], ["pivot-glissant", 1, 0], ["rotule", 0, 0]]},
            {"titre": "Vis de serrage / mâchoire basse", "img": "pince", "R": ["vis"], "B": ["machInf", "patinInf"],
             "rN": "la vis de serrage (avec sa molette)", "bN": "la mâchoire basse", "mob": [0, 1, 0, 0, 1, 0], "nom": "Hélicoïdale", "axe": "y",
             "anim": {"t": "translate", "dx": 0, "dy": -14}, "plan": "(O, x, y)",
             "why": "En tournant la molette, la vis monte ou descend dans la mâchoire basse : translation et rotation suivant y sont liées, 1 seul degré de liberté.",
             "sch": [["helicoidale", 0, 90, True], ["helicoidale", 0, 0], ["pivot-glissant", 0, 90], ["pivot", 0, 90]]},
        ],
        "graphe": {"w": 660, "h": 270, "nodes": {"tel": [70, 50, "Téléphone"], "porte": [330, 50, "Porte-téléphone"],
                                                  "sup": [590, 50, "Mâchoire haute"], "inf": [590, 220, "Mâchoire basse"],
                                                  "vis": [330, 220, "Vis"]},
                   "edges": [["tel", "porte", 0], ["porte", "sup", 1], ["sup", "inf", 2], ["vis", "inf", 3]]},
        "retenir": "la pince n'est pas une seule pièce : deux mâchoires articulées (pivot) serrées par une vis (hélicoïdale). "
                   "Le porte-téléphone s'oriente grâce à une rotule, que l'on bloque en serrant la molette : une fois réglée, elle "
                   "se comporte comme un encastrement.",
    },
    {
        "slug": "imprimante-3d", "num": 3, "titre": "L'imprimante 3D",
        "card": "Une imprimante 3D cartésienne : la buse et le plateau se déplacent suivant trois glissières.",
        "intro": "Pour déposer le fil fondu couche par couche, la buse doit atteindre chaque point du volume d'impression. Regarde comment.",
        "images": {
            "imp": {"file": "imprimante-3d.png", "w": 390, "h": 403, "rep": REP_IMP,
                    "alt": "Imprimante 3D : tête d'impression sur une poutre horizontale, deux montants, plateau et socle avec écran",
                    "zones": {
                        "tete": "M165 75 L205 72 L210 140 L190 150 L168 145Z",
                        "poutre": "M86 103 L300 118 L302 160 L265 158 L86 145Z",
                        "colG": "M120 62 L142 62 L142 298 L120 298Z",
                        "traverse": "M120 62 L145 60 L300 88 L300 110 L142 86Z",
                        "colD": "M278 92 L300 92 L300 320 L278 316Z",
                        "plateau": "M76 292 L140 246 L282 256 L236 305Z",
                        "socle": "M48 300 L76 292 L236 305 L282 262 L290 290 L280 322 L245 352 L190 362 L52 330Z",
                        "ecran": "M201 302 L250 299 L247 330 L200 336Z"}}},
        "etudes": [
            {"titre": "Tête / poutre", "img": "imp", "R": ["tete"], "B": ["poutre"],
             "rN": "la tête d'impression", "bN": "la poutre horizontale", "mob": [1, 0, 0, 0, 0, 0], "nom": "Glissière", "axe": "x",
             "anim": {"t": "translate", "dx": 45, "dy": 3}, "plan": "de face (O, x, z)",
             "why": "La tête coulisse le long de la poutre (axe x) sur des galets ou des patins : elle ne peut pas tourner.",
             "sch": [["glissiere", 0, 0, True], ["glissiere", 0, 90], ["pivot-glissant", 0, 0], ["glissiere", 1, 0]]},
            {"titre": "Poutre / montants", "img": "imp", "R": ["poutre", "tete"], "B": ["colG", "traverse", "colD"],
             "rN": "la poutre (avec la tête)", "bN": "les montants", "mob": [0, 0, 1, 0, 0, 0], "nom": "Glissière", "axe": "z",
             "anim": {"t": "translate", "dx": 0, "dy": -28}, "plan": "de face (O, x, z)",
             "why": "La poutre monte d'une couche à chaque étape en glissant le long des montants verticaux (axe z). Des vis la font monter, mais le guidage est une glissière.",
             "sch": [["glissiere", 0, 90, True], ["glissiere", 0, 0], ["helicoidale", 0, 90], ["pivot-glissant", 0, 90]]},
            {"titre": "Plateau / socle", "img": "imp", "R": ["plateau"], "B": ["socle"],
             "rN": "le plateau d'impression", "bN": "le socle", "mob": [0, 1, 0, 0, 0, 0], "nom": "Glissière", "axe": "y",
             "anim": {"t": "translate", "dx": -22, "dy": 20}, "plan": "de face (O, x, z)",
             "why": "Le plateau avance et recule (axe y) sur deux rails du socle : c'est la troisième direction de déplacement.",
             "sch": [["glissiere", 1, 0, True], ["glissiere", 0, 0], ["glissiere", 0, 90], ["pivot", 1, 0]]},
            {"titre": "Écran / socle", "img": "imp", "R": ["ecran"], "B": ["socle"],
             "rN": "l'écran tactile", "bN": "le socle", "mob": [0, 0, 0, 0, 0, 0], "nom": "Encastrement", "axe": "-",
             "anim": None, "plan": "de face (O, x, z)",
             "why": "L'écran est fixé dans le socle : aucun mouvement possible.",
             "sch": [["encastrement", 0, 0, True], ["appui-plan", 0, 0], ["glissiere", 1, 0], ["ponctuelle", 0, 0]]},
        ],
        "graphe": {"w": 620, "h": 305, "nodes": {"tete": [70, 50, "Tête"], "poutre": [320, 50, "Poutre"],
                                                  "bati": [550, 150, "Bâti"], "plateau": [240, 265, "Plateau"], "ecran": [550, 280, "Écran"]},
                   "edges": [["tete", "poutre", 0], ["poutre", "bati", 1], ["plateau", "bati", 2], ["ecran", "bati", 3]]},
        "retenir": "une imprimante 3D cartésienne utilise trois glissières perpendiculaires, suivant x, y et z. Chacune apporte un "
                   "degré de liberté : ensemble, elles permettent à la buse d'atteindre n'importe quel point du volume d'impression "
                   "par rapport au plateau.",
    },
    {
        "slug": "grue-camera", "num": 4, "titre": "La grue de tournage",
        "card": "Une grue caméra sur le toit d'une voiture de tournage : tourelle, bras et tête stabilisée.",
        "intro": "Pour filmer une voiture en mouvement, une grue montée sur une autre voiture oriente la caméra dans toutes les directions.",
        "images": {
            "grue": {"file": "grue-camera.jpg", "w": 529, "h": 339, "rep": dict(REP_XY, pos="tr"),
                     "alt": "Voiture de tournage avec une grue sur le toit : tourelle, bras en treillis et tête caméra stabilisée",
                     "zones": {
                         "voiture": "M224 190 L255 160 L298 150 L420 156 L462 188 L472 262 L458 300 L300 302 L238 292 L224 262Z",
                         "tourelle": "M298 102 Q300 86 342 86 Q386 88 386 104 L386 152 L298 152Z",
                         "bras": "M66 96 L120 85 L230 45 L400 32 L408 82 L386 88 L300 102 L230 110 L112 128 L108 152 L68 152 L66 110Z",
                         "tete": "M44 178 Q46 150 88 150 Q132 152 132 190 L130 240 Q112 270 86 270 Q56 268 44 238Z"}}},
        "etudes": [
            {"titre": "Tourelle / voiture", "img": "grue", "R": ["tourelle", "bras", "tete"], "B": ["voiture"],
             "rN": "la tourelle (avec le bras)", "bN": "la voiture", "mob": [0, 0, 0, 0, 1, 0], "nom": "Pivot", "axe": "y",
             "anim": {"t": "scaleX", "ox": 342, "oy": 0}, "plan": "(O, x, y)",
             "why": "La tourelle tourne sur le toit autour d'un axe vertical (y) pour orienter le bras vers l'avant, le côté ou l'arrière.",
             "sch": [["pivot", 0, 90, True], ["pivot", 0, 0], ["pivot", 1, 0], ["glissiere", 0, 90]]},
            {"titre": "Bras / tourelle", "img": "grue", "R": ["bras", "tete"], "B": ["tourelle"],
             "rN": "le bras (avec la tête caméra)", "bN": "la tourelle", "mob": [0, 0, 0, 0, 0, 1], "nom": "Pivot", "axe": "z",
             "anim": {"t": "rotate", "a": 8, "ox": 350, "oy": 92}, "plan": "(O, x, y)",
             "why": "Le bras monte et descend en tournant autour d'un axe horizontal, perpendiculaire à la photo (z), en haut de la tourelle.",
             "sch": [["pivot", 1, 0, True], ["pivot", 0, 0], ["pivot", 0, 90], ["rotule", 0, 0]]},
            {"titre": "Tête caméra / bras", "img": "grue", "R": ["tete"], "B": ["bras"],
             "rN": "la tête caméra", "bN": "le bout du bras", "mob": [0, 0, 0, 1, 1, 1], "nom": "Rotule", "axe": "-",
             "anim": {"t": "rotate", "a": 22, "ox": 88, "oy": 150}, "plan": "(O, x, y)",
             "why": "La tête stabilisée tourne autour de trois axes grâce à trois moteurs : vue de l'extérieur, elle se comporte comme une rotule (liaison équivalente).",
             "sch": [["rotule", 0, 0, True], ["rotule-a-doigt", 0, 0], ["pivot", 1, 0], ["ponctuelle", 1, 0]]},
        ],
        "graphe": {"w": 500, "h": 260, "nodes": {"voiture": [80, 210, "Voiture"], "tourelle": [80, 50, "Tourelle"],
                                                  "bras": [410, 50, "Bras"], "tete": [410, 210, "Tête caméra"]},
                   "edges": [["tourelle", "voiture", 0], ["bras", "tourelle", 1], ["tete", "bras", 2]]},
        "retenir": "la tête stabilisée contient trois moteurs de rotation mais, vue de l'extérieur, elle équivaut à une rotule. "
                   "La grue enchaîne ainsi deux pivots (orienter, puis incliner le bras) et une rotule pour viser dans toutes les "
                   "directions, même quand la voiture roule.",
    },
]
