#!/usr/bin/env python3
"""Extraction (une seule fois) des séries 1 à 3 de l'exercice 1.1 depuis leurs pages d'origine.

    python3 src/exercices/extraire_series.py ancienne-serie-1.html ancienne-serie-2.html ancienne-serie-3.html

Écrit src/exercices/series.json (systèmes, études, réponses, corrections rédigées) et les photos dans src/images/series/.
"""
import base64
import html
import json
import pathlib
import re
import sys
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
NOMS = ["Encastrement", "Pivot glissant", "Pivot", "Glissière", "Hélicoïdale", "Appui plan", "Rotule à doigt", "Rotule",
        "Linéaire rectiligne", "Linéaire annulaire", "Ponctuelle"]


def norm(s):
    return unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()


def nom_de(expected):
    e = norm(expected)
    if e.startswith("spherique") or e.startswith("rotule"):
        return "Rotule à doigt" if "doigt" in e else "Rotule"
    for n in NOMS:
        if e.startswith(norm(n)):
            return n
    raise ValueError("liaison inconnue : " + expected)


def axe_de(expected):
    m = re.search(r"(?:d'axe|de normale) ([xyz])", expected, re.I)
    return m.group(1).lower() if m else "-"


def main(paths):
    out = []
    (ROOT / "src" / "images" / "series").mkdir(parents=True, exist_ok=True)
    for num, path in enumerate(paths, 1):
        s = pathlib.Path(path).read_text(encoding="utf-8")
        qcfg = json.loads(re.search(r"window.__QCFG__ = (\{.*?\});", s).group(1))
        titre = html.unescape(re.search(r'<h1 id="home-title">(.*?)</h1>', s).group(1))
        systemes = []
        for m in re.finditer(r'<section class="part" id="partie-(\d+)".*?(?=<section class="part"|<section[^>]*recap)', s, re.S):
            p, part = m.group(1), m.group(0)
            nom_sys = html.unescape(re.search(r'</span>(.*?)</h2>', part).group(1))
            minutes = int(re.search(r"Durée conseillée : (\d+) min", part).group(1))
            im = re.search(r'<img src="data:image/(\w+);base64,([^"]+)" alt="([^"]*)" width="(\d+)" height="(\d+)"', part)
            ext = "jpg" if im.group(1) == "jpeg" else im.group(1)
            fichier = f"series/s{num}-p{int(p):02d}.{ext}"
            (ROOT / "src" / "images" / fichier).write_bytes(base64.b64decode(im.group(2)))
            etudes = []
            for q in re.finditer(r'<div class="qbar".*?qb-title">(.*?)</div>.*?<div class="fast-q mob-q" id="g([\d_]+)">(.*?)<div class="q-why">(.*?)</div>\s*</div>\s*</div>',
                                 part, re.S):
                t, gid, body, why = q.groups()
                key = "q" + gid
                mob = [int(qcfg[f"{key}_{a}"]["grader"]["equals"][0]) for a in ("tx", "ty", "tz", "rx", "ry", "rz")]
                expected = html.unescape(re.sub(r"<[^>]+>", "", re.search(r'<p class="q-expected"><span>Réponse attendue :</span>(.*?)</p>', body).group(1))).strip()
                etudes.append({"titre": html.unescape(t), "mob": mob, "ddl": qcfg[key + "_ddl"]["grader"]["value"],
                               "nom": nom_de(expected), "axe": axe_de(expected), "attendu": expected, "why": why.strip()})
            systemes.append({"titre": nom_sys, "minutes": minutes, "img": fichier, "alt": html.unescape(im.group(3)),
                             "w": int(im.group(4)), "h": int(im.group(5)), "etudes": etudes})
        out.append({"num": num, "titre": titre, "systemes": systemes})
        print(f"série {num} : {len(systemes)} systèmes, {sum(len(x['etudes']) for x in systemes)} études")
    (ROOT / "src" / "exercices" / "series.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main(sys.argv[1:])
