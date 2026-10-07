/* Exercice 2.1 — étude de toutes les liaisons d'un système réel (moteur commun).
   Données : window.__SYSTEME__ (voir src/exercices/systemes.py). Dépend de SCHEMAS (src/cours/schemas.js). */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var D = window.__SYSTEME__;
  var MVT = ["Tx", "Ty", "Tz", "Rx", "Ry", "Rz"];
  var NOMS = ["Encastrement", "Pivot", "Glissière", "Pivot glissant", "Hélicoïdale", "Appui plan",
              "Rotule", "Rotule à doigt", "Linéaire rectiligne", "Linéaire annulaire", "Ponctuelle"];
  var PTS = { mob: 0.5, nom: 2, axe: 1, sch: 1 }; // 7 points et 9 questions par étude
  var ET = D.etudes;
  var st = ET.map(function () { return { v: [0, 0, 0, 0, 0, 0], done12: false, done3: false, pts: 0, nomRep: null, axeRep: null }; });
  var cur = 0, curImg = null;

  function nomComplet(nom, axe) { return nom + (axe && axe !== "-" ? " d'axe " + axe : ""); }

  function showImage(id) {
    if (curImg === id) return;
    curImg = id;
    var im = D.images[id], r = im.rep;
    $("#fig-img").src = im.src; $("#fig-img").width = im.w; $("#fig-img").height = im.h; $("#fig-img").alt = im.alt;
    $("#ov").setAttribute("viewBox", "0 0 " + im.w + " " + im.h);
    var rep = '<svg class="eo-rep" viewBox="0 0 100 90" role="img" aria-label="' + r.label + '">';
    r.axes.forEach(function (a) {
      if (a[1] === 0 && a[2] === 0) {
        rep += '<circle cx="30" cy="60" r="7" class="o"/><circle cx="30" cy="60" r="2" class="pt"/><text x="' + 12 + '" y="84">' + a[0] + "</text>";
      } else {
        rep += '<line x1="30" y1="60" x2="' + (30 + a[1]) + '" y2="' + (60 + a[2]) + '" marker-end="url(#rp)"/><text x="' +
          (30 + a[1] * 1.25 - 4) + '" y="' + (60 + a[2] * 1.25 + 5) + '">' + a[0] + "</text>";
      }
    });
    rep += '<defs><marker id="rp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10z"/></marker></defs></svg>';
    $("#fig-rep").innerHTML = rep;
    $("#fig-rep").className = "rep-pos " + (r.pos || "bl");
  }
  function zones(list, cls, img) {
    return list.map(function (k) { return '<path class="' + cls + '" d="' + D.images[img].zones[k] + '"/>'; }).join("");
  }
  function overlay(i) {
    var e = ET[i];
    showImage(e.img);
    $("#ov-static").innerHTML = zones(e.B, "zb", e.img) + zones(e.R, "zr", e.img);
    $("#ov-move").innerHTML = "";
  }
  function play(i) {
    var e = ET[i], g = $("#ov-move"), svg = $("#ov");
    if (g._a) g._a.cancel();
    if (!e.anim) { svg.classList.remove("blocked"); void svg.getBoundingClientRect(); svg.classList.add("blocked"); return; }
    g.innerHTML = zones(e.R, "zm", e.img);
    var a = e.anim, kf = [];
    g.style.transformOrigin = (a.ox || 0) + "px " + (a.oy || 0) + "px";
    for (var t = 0; t <= 32; t++) {
      var s = Math.sin(t / 32 * 2 * Math.PI), c = Math.cos(t / 32 * 2 * Math.PI), tr;
      if (a.t === "rotate") tr = "rotate(" + (a.a * s).toFixed(2) + "deg)";
      else if (a.t === "translate") tr = "translate(" + (a.dx * s).toFixed(1) + "px," + (a.dy * s).toFixed(1) + "px)";
      else tr = a.t + "(" + c.toFixed(3) + ")";
      kf.push({ transform: tr });
    }
    g._a = g.animate(kf, { duration: 2800, iterations: 2 });
    g._a.onfinish = function () { g.innerHTML = ""; };
  }
  function schemaHTML(s) {
    return '<div class="sch-in" style="transform:rotate(' + -s[2] + 'deg)">' + SCHEMAS[s[0]][s[1]].svg + "</div>";
  }

  function render() {
    var e = ET[cur], s = st[cur];
    overlay(cur);
    $$("#tabs button").forEach(function (b, i) {
      b.setAttribute("aria-selected", i === cur ? "true" : "false");
      b.classList.toggle("fini", st[i].done3);
    });
    var table = '<table class="mob"><thead><tr><th colspan="3">Translation</th><th colspan="3">Rotation</th></tr><tr>' +
      MVT.map(function (m) { return "<th>" + m + "</th>"; }).join("") + "</tr></thead><tbody><tr>" +
      s.v.map(function (v, i) {
        var cls = s.done12 ? (v === e.mob[i] ? "g-ok" : "g-ko") : "";
        return '<td class="' + cls + '"><button type="button" class="mob-g" data-i="' + i + '" data-v="' + v + '"' + (s.done12 ? " disabled" : "") +
          ' aria-label="' + MVT[i] + " : " + v + '">' + v + "</button></td>";
      }).join("") + "</tr></tbody></table>";
    var noms = NOMS.map(function (n) {
      var cls = s.done12 ? (n === e.nom ? " good" : (s.nomRep === n ? " bad" : "")) : "";
      return '<label class="nm' + cls + '"><input type="radio" name="nom" value="' + n + '"' + (s.nomRep === n ? " checked" : "") +
        (s.done12 ? " disabled" : "") + "> " + n + "</label>";
    }).join("");
    var axes = ["x", "y", "z", "-"].map(function (a) {
      var cls = s.done12 ? (a === e.axe ? " good" : (s.axeRep === a ? " bad" : "")) : "";
      return '<label class="ax' + cls + '"><input type="radio" name="axe" value="' + a + '"' + (s.axeRep === a ? " checked" : "") +
        (s.done12 ? " disabled" : "") + "> " + (a === "-" ? "sans axe" : a) + "</label>";
    }).join("");
    var order = [1, 3, 0, 2].map(function (k) { return (k + cur) % 4; });
    var sch = order.map(function (k) {
      var o = e.sch[k], cls = s.done3 ? (o[3] ? " good" : (s.schRep === k ? " bad" : "")) : "";
      return '<button type="button" class="sch-opt' + cls + '" data-k="' + k + '"' + (s.done3 || !s.done12 ? " disabled" : "") +
        ' aria-label="Schéma ' + (order.indexOf(k) + 1) + '">' + schemaHTML(o) + "</button>";
    }).join("");
    var ok3 = s.done3 && e.sch[s.schRep][3];
    $("#etude").innerHTML =
      "<h2>Étude " + (cur + 1) + " — " + e.titre + "</h2>" +
      '<p class="consigne">On s\'intéresse à la liaison de <b class="r">' + e.rN + '</b> avec <b class="b">' + e.bN + "</b>." +
      (e.note ? ' <span class="small">' + e.note + "</span>" : "") + "</p>" +
      '<section class="q"><h3><span class="qn">1</span> Remplis le tableau des mobilités</h3><p class="small">Clique sur une case pour passer de 0 à 1.</p>' + table + "</section>" +
      '<section class="q"><h3><span class="qn">2</span> Quel est le nom de cette liaison ? Quel est son axe ?</h3><div class="noms">' + noms +
      '</div><div class="axes"><span>Axe :</span>' + axes + "</div>" +
      (s.done12 ? "" : '<button type="button" class="btn" id="val12">Valider les questions 1 et 2</button><p class="warn" id="warn" aria-live="polite"></p>') + "</section>" +
      (s.done12 ? '<div class="fb ' + (s.ok12 ? "ok" : "ko") + '"><p><strong>' + (s.ok12 ? "✔ " : "✘ ") + "Correction :</strong> " +
        nomComplet(e.nom, e.axe).toLowerCase() + ". " + e.why + '</p><button type="button" class="btn ghost" id="voir">▶ Voir le mouvement</button></div>' : "") +
      '<section class="q' + (s.done12 ? "" : " locked") + '"><h3><span class="qn">3</span> Par quel dessin représente-t-on cette liaison dans le plan ' + e.plan + " ?</h3>" +
      (s.done12 ? "" : '<p class="lock">Réponds d\'abord aux questions 1 et 2.</p>') + '<div class="schs">' + sch + "</div>" +
      (s.done3 ? '<p class="fb ' + (ok3 ? "ok" : "ko") + '">' + (ok3 ? "✔ Bon schéma." :
        "✘ Ce n'est pas le bon schéma : vérifie le type de liaison et l'orientation de son axe dans le plan " + e.plan + ".") + "</p>" : "") + "</section>" +
      '<div class="nav">' + (cur < ET.length - 1 ? '<button type="button" class="btn" id="next">Étude suivante ▶</button>'
        : '<button type="button" class="btn" id="bilan-btn">Voir le bilan ▶</button>') + "</div>";

    $$(".mob-g").forEach(function (b) {
      b.addEventListener("click", function () { var i = +b.getAttribute("data-i"); s.v[i] = s.v[i] ? 0 : 1; render(); });
    });
    $$('input[name="nom"]').forEach(function (r) { r.addEventListener("change", function () { s.nomRep = r.value; }); });
    $$('input[name="axe"]').forEach(function (r) { r.addEventListener("change", function () { s.axeRep = r.value; }); });
    var v12 = $("#val12");
    if (v12) v12.addEventListener("click", function () {
      if (!s.nomRep || !s.axeRep) { $("#warn").textContent = "Choisis un nom de liaison et un axe avant de valider."; return; }
      var p = 0;
      s.v.forEach(function (v, i) { if (v === e.mob[i]) p += PTS.mob; });
      s.ok12 = p === 3 && s.nomRep === e.nom && s.axeRep === e.axe;
      if (s.nomRep === e.nom) p += PTS.nom;
      if (s.axeRep === e.axe) p += PTS.axe;
      s.pts = p; s.done12 = true; score(); render(); play(cur);
    });
    var voir = $("#voir"); if (voir) voir.addEventListener("click", function () { play(cur); });
    $$(".sch-opt").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = +b.getAttribute("data-k"); s.schRep = k; s.done3 = true;
        if (e.sch[k][3]) s.pts += PTS.sch;
        score(); render();
      });
    });
    var nx = $("#next"); if (nx) nx.addEventListener("click", function () { cur++; render(); window.scrollTo(0, $("#tabs").offsetTop - 8); });
    var bl = $("#bilan-btn"); if (bl) bl.addEventListener("click", bilan);
  }

  function note() {
    var pts = st.reduce(function (a, s) { return a + s.pts; }, 0);
    return pts / (ET.length * 7) * 20;
  }
  function score() {
    var done = st.reduce(function (a, s) { return a + (s.done12 ? 8 : 0) + (s.done3 ? 1 : 0); }, 0);
    $("#sc-q").textContent = done + " / " + ET.length * 9;
    $("#sc-n").textContent = note().toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " / 20";
  }

  // bilan : graphe des liaisons construit à partir des réponses de l'élève
  function bilan() {
    var G = D.graphe, N = G.nodes;
    var svg = '<svg viewBox="0 0 ' + G.w + " " + G.h + '" class="graphe" role="img" aria-label="Graphe des liaisons">';
    G.edges.forEach(function (ed) {
      var a = N[ed[0]], b = N[ed[1]], e = ET[ed[2]], s = st[ed[2]];
      var ok = s.done12 && s.nomRep === e.nom && s.axeRep === e.axe;
      var lab = s.done12 ? nomComplet(s.nomRep, s.axeRep) : "?";
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      svg += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" class="' + (ok ? "gg" : "gk") + '"/>' +
        '<rect x="' + (mx - 68) + '" y="' + (my - 11) + '" width="136" height="22" rx="11" class="lb ' + (ok ? "gg" : "gk") + '"/><text x="' + mx + '" y="' + (my + 4) + '">' + lab + "</text>";
    });
    Object.keys(N).forEach(function (k) {
      var n = N[k];
      svg += '<ellipse cx="' + n[0] + '" cy="' + n[1] + '" rx="58" ry="20" class="nd"/><text x="' + n[0] + '" y="' + (n[1] + 5) + '" class="nt">' + n[2] + "</text>";
    });
    svg += "</svg>";
    $("#etude").innerHTML = "<h2>Bilan — le graphe des liaisons</h2>" +
      "<p>Chaque ellipse est une pièce (ou un groupe de pièces), chaque trait une liaison, avec <strong>ta</strong> réponse (vert : juste, rouge : à revoir).</p>" + svg +
      '<div class="retenir"><p><strong>À retenir :</strong> ' + D.retenir + "</p></div>" +
      '<p class="note-fin">Note : <b>' + $("#sc-n").textContent + "</b></p>" +
      '<div class="nav"><button type="button" class="btn ghost" id="back">◀ Revenir aux études</button> <button type="button" class="btn ghost" id="print">Imprimer</button></div>';
    $("#ov-static").innerHTML = "";
    showImage(D.bilanImg || ET[0].img);
    $("#back").addEventListener("click", function () { cur = 0; render(); });
    $("#print").addEventListener("click", function () { window.print(); });
    $$("#tabs button").forEach(function (b) { b.setAttribute("aria-selected", "false"); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("#tabs").innerHTML = ET.map(function (e, i) { return '<button type="button" role="tab" data-i="' + i + '">' + (i + 1) + ". " + e.titre + "</button>"; }).join("");
    $$("#tabs button").forEach(function (b) { b.addEventListener("click", function () { cur = +b.getAttribute("data-i"); render(); }); });
    score(); render();
  });
  window.__ETUDES__ = { ETUDES: ET, st: st, note: note };
})();
