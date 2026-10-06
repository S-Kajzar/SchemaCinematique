/* Schémas normalisés des 11 liaisons (représentations planes), dessinés en SVG.
   Convention du cours : pièce 1 en bleu (fixe), pièce 2 en rouge (mobile).
   Chaque vue rend un <svg> avec un groupe .s1 (pièce 1) et un groupe .s2 (pièce 2) ;
   « anim » décrit le mouvement que l'on peut voir dans le plan de la vue (null : aucun). */
var SCHEMAS = (function () {
  function L(x1, y1, x2, y2) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>'; }
  function R(x, y, w, h) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/>'; }
  function C(cx, cy, r, cls) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"' + (cls ? ' class="' + cls + '"' : "") + '/>'; }
  function P(d, cls) { return '<path d="' + d + '"' + (cls ? ' class="' + cls + '"' : "") + '/>'; }
  function T(x, y, s) { return '<text x="' + x + '" y="' + y + '">' + s + "</text>"; }
  // petit triangle plein (repère d'appartenance d'un trait à une pièce), posé sur (x, y)
  function flag(x, y, dir) {
    var s = 6;
    if (dir === "up") return P("M" + (x - s) + " " + y + " L" + (x + s) + " " + y + " L" + x + " " + (y - 1.6 * s) + " Z", "fill");
    if (dir === "down") return P("M" + (x - s) + " " + y + " L" + (x + s) + " " + y + " L" + x + " " + (y + 1.6 * s) + " Z", "fill");
    if (dir === "left") return P("M" + x + " " + (y - s) + " L" + x + " " + (y + s) + " L" + (x - 1.6 * s) + " " + y + " Z", "fill");
    return P("M" + x + " " + (y - s) + " L" + x + " " + (y + s) + " L" + (x + 1.6 * s) + " " + y + " Z", "fill");
  }
  // arc de cercle de a0 à a1 (degrés, sens trigonométrique, y vers le haut)
  function arc(cx, cy, r, a0, a1) {
    var p0 = [cx + r * Math.cos(a0 * Math.PI / 180), cy - r * Math.sin(a0 * Math.PI / 180)];
    var p1 = [cx + r * Math.cos(a1 * Math.PI / 180), cy - r * Math.sin(a1 * Math.PI / 180)];
    var large = (a1 - a0) % 360 > 180 ? 1 : 0;
    return P("M" + p0[0].toFixed(1) + " " + p0[1].toFixed(1) + " A" + r + " " + r + " 0 " + large + " 0 " +
             p1[0].toFixed(1) + " " + p1[1].toFixed(1));
  }
  function svg(label, s1, s2, anim) {
    var a = anim ? ' data-anim="' + anim.type + '" style="transform-origin:' + anim.ox + "px " + anim.oy + 'px"' : "";
    return '<svg class="schema" viewBox="0 0 160 120" role="img" aria-label="' + label + '">' +
      '<g class="s1">' + s1 + "</g>" + '<g class="s2"' + a + ">" + s2 + "</g></svg>";
  }
  function arbre(x1, x2, y) { return L(x1, y, x2, y); }

  var V = {};
  V.encastrement = [{
    cap: "Représentation plane",
    svg: svg("Encastrement : la pièce 2 est soudée à la pièce 1",
      L(18, 86, 142, 86) + T(20, 104, "1"),
      L(66, 86, 122, 30) + P("M66 86 L88 86 A22 22 0 0 0 81.6 70.4 Z", "fill") + T(124, 30, "2"), null)
  }];
  V.pivot = [{
    cap: "Vue de côté",
    svg: svg("Pivot, vue de côté : arbre 2 arrêté des deux côtés du palier 1",
      R(50, 48, 60, 24) + L(80, 48, 80, 22) + flag(80, 48, "up") + T(86, 26, "1"),
      arbre(18, 142, 60) + L(42, 49, 42, 71) + L(118, 49, 118, 71) + T(134, 52, "2"), null)
  }, {
    cap: "Vue suivant l'axe",
    svg: svg("Pivot, vue suivant l'axe : la pièce 2 tourne dans la pièce 1",
      C(80, 60, 24) + L(80, 36, 80, 14) + flag(80, 36, "up") + T(86, 18, "1"),
      C(80, 60, 13) + L(89, 69, 128, 104) + T(130, 100, "2"), { type: "rot", ox: 80, oy: 60 })
  }];
  V["pivot-glissant"] = [{
    cap: "Vue de côté",
    svg: svg("Pivot glissant, vue de côté : l'arbre 2 coulisse et tourne dans la pièce 1",
      R(50, 48, 60, 24) + L(80, 48, 80, 22) + flag(80, 48, "up") + T(86, 26, "1"),
      arbre(14, 146, 60) + T(136, 52, "2"), { type: "tx", ox: 80, oy: 60 })
  }, {
    cap: "Vue suivant l'axe",
    svg: svg("Pivot glissant, vue suivant l'axe",
      C(80, 60, 24) + L(80, 36, 80, 14) + flag(80, 36, "up") + T(86, 18, "1"),
      C(80, 60, 4, "fill") + L(80, 60, 124, 104) + T(126, 100, "2"), { type: "rot", ox: 80, oy: 60 })
  }];
  V.glissiere = [{
    cap: "Vue de côté",
    svg: svg("Glissière, vue de côté : la pièce 2 coulisse sans tourner",
      R(50, 48, 60, 24) + L(80, 48, 80, 22) + flag(80, 48, "up") + T(86, 26, "1"),
      arbre(14, 146, 60) + T(136, 52, "2"), { type: "tx", ox: 80, oy: 60 })
  }, {
    cap: "Vue suivant l'axe",
    svg: svg("Glissière, vue suivant l'axe : section carrée, aucune rotation possible",
      R(56, 36, 48, 48) + L(80, 36, 80, 14) + flag(80, 36, "up") + T(86, 18, "1"),
      R(64, 44, 32, 32) + L(64, 44, 96, 76) + L(96, 44, 64, 76) + L(96, 76, 126, 106) + T(128, 102, "2"), null)
  }];
  V.helicoidale = [{
    cap: "Vue de côté (filet)",
    svg: svg("Hélicoïdale : la vis 2 avance en tournant dans l'écrou 1",
      R(46, 44, 68, 32) + L(80, 44, 80, 20) + flag(80, 44, "up") + T(86, 24, "1"),
      arbre(12, 46, 60) + arbre(114, 148, 60) +
      P("M46 60 L52 50 L60 70 L68 50 L76 70 L84 50 L92 70 L100 50 L108 70 L114 60") + T(138, 52, "2"),
      { type: "screw", ox: 80, oy: 60 })
  }, {
    cap: "Autre représentation",
    svg: svg("Hélicoïdale, représentation simplifiée par un trait oblique",
      R(46, 44, 68, 32) + L(80, 44, 80, 20) + flag(80, 44, "up") + T(86, 24, "1"),
      arbre(12, 148, 60) + L(52, 72, 108, 48) + T(138, 52, "2"), { type: "screw", ox: 80, oy: 60 })
  }];
  V["appui-plan"] = [{
    cap: "Représentation plane",
    svg: svg("Appui plan : deux plans parallèles en contact",
      L(22, 72, 138, 72) + L(52, 72, 36, 102) + flag(46, 83, "left") + T(24, 104, "1"),
      L(22, 62, 138, 62) + L(108, 62, 124, 32) + T(128, 34, "2"), { type: "tx", ox: 80, oy: 62 })
  }];
  V["lineaire-rectiligne"] = [{
    cap: "Vue suivant la ligne de contact",
    svg: svg("Linéaire rectiligne vue suivant la ligne de contact : un dièdre posé sur un plan",
      L(22, 84, 138, 84) + T(24, 102, "1"),
      P("M60 40 L100 40 L80 84 Z") + L(80, 40, 80, 16) + T(86, 22, "2"), { type: "rock", ox: 80, oy: 84 })
  }, {
    cap: "Vue de face",
    svg: svg("Linéaire rectiligne vue de face : contact selon une ligne",
      L(22, 84, 138, 84) + T(24, 102, "1"),
      P("M44 84 L116 84 L100 52 L60 52 Z") + L(80, 52, 80, 24) + T(86, 30, "2"), { type: "tx", ox: 80, oy: 84 })
  }];
  V.ponctuelle = [{
    cap: "Vue de côté",
    svg: svg("Ponctuelle : une pointe 2 en contact en un point avec le plan 1",
      L(112, 18, 112, 102) + T(120, 104, "1"),
      P("M80 44 L80 76 L112 60 Z", "fill") + L(80, 60, 28, 60) + T(30, 52, "2"), { type: "ty", ox: 112, oy: 60 })
  }, {
    cap: "Autre représentation",
    svg: svg("Ponctuelle : une sphère 2 posée sur le plan 1",
      L(22, 88, 138, 88) + T(24, 106, "1"),
      C(80, 68, 20) + L(94, 54, 120, 28) + T(124, 30, "2"), { type: "roll", ox: 80, oy: 68 })
  }];
  V["lineaire-annulaire"] = [{
    cap: "Vue de côté",
    svg: svg("Linéaire annulaire : une sphère 2 dans un cylindre 1",
      P("M138 38 L30 38 L30 82 L138 82") + L(30, 60, 12, 60) + flag(30, 60, "left") + T(12, 52, "1"),
      C(80, 60, 21) + L(95, 45, 122, 18) + T(126, 20, "2"), { type: "roll", ox: 80, oy: 60 })
  }, {
    cap: "Vue suivant l'axe",
    svg: svg("Linéaire annulaire vue suivant l'axe du cylindre",
      arc(80, 62, 26, 70, 380) + L(80, 88, 80, 108) + flag(80, 98, "left") + T(88, 110, "1"),
      C(80, 62, 20) + L(94, 48, 124, 18) + T(128, 20, "2"), { type: "rot", ox: 80, oy: 62 })
  }];
  V.rotule = [{
    cap: "Représentation plane",
    svg: svg("Rotule : une sphère 2 dans une sphère creuse 1",
      arc(80, 60, 25, 35, 325) + L(55, 60, 18, 60) + flag(36, 60, "up") + T(18, 52, "1"),
      C(80, 60, 17) + L(97, 60, 144, 60) + T(136, 52, "2"), { type: "rot", ox: 80, oy: 60 })
  }];
  V["rotule-a-doigt"] = [{
    cap: "Représentation plane",
    svg: svg("Rotule à doigt : un doigt 2 bloque une rotation dans une rainure de 1",
      arc(80, 60, 25, 35, 78) + arc(80, 60, 25, 102, 325) + L(55, 60, 18, 60) + flag(36, 60, "up") + T(18, 52, "1"),
      C(80, 60, 17) + L(80, 43, 80, 24) + L(97, 60, 144, 60) + T(136, 52, "2"), { type: "rock", ox: 80, oy: 60 })
  }];
  return V;
})();
