/* Moteur commun des exercices « étude des liaisons » (exercices 1.1 et 2.1).
   Données : window.__SYSTEME__ (images, études, graphe, retenir). Dépend de SCHEMAS (src/cours/schemas.js).
   Une étude : img, titre, consigne (rN/bN ou texte), mob (Tx…Rz), nom, axe ("-" : sans axe),
   et en option : ddl (question du nombre de ddl), R/B (zones colorées), anim, sch (question du schéma), why. */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var D = window.__SYSTEME__;
  var MVT = ["Tx", "Ty", "Tz", "Rx", "Ry", "Rz"];
  var NOMS = ["Encastrement", "Pivot", "Glissière", "Pivot glissant", "Hélicoïdale", "Appui plan",
              "Rotule", "Rotule à doigt", "Linéaire rectiligne", "Linéaire annulaire", "Ponctuelle"];
  var PTS = { mob: 0.5, ddl: 1, nom: 2, axe: 1, sch: 1 };
  var ET = D.etudes;
  var st = ET.map(function () { return { v: [0, 0, 0, 0, 0, 0], ddl: null, nom: null, axe: null, sch: null, val12: false, val3: false }; });
  var cur = 0, curImg = null, mode = null, rendu = false, t0 = null, tick = null;

  function nomComplet(nom, axe) {
    if (!nom) return "?";
    var k = nom === "Appui plan" || nom === "Ponctuelle" ? " de normale " : " d'axe ";
    return nom + (axe && axe !== "-" ? k + axe : "");
  }
  function maxPts(e) { return 6 * PTS.mob + PTS.nom + PTS.axe + (e.ddl != null ? PTS.ddl : 0) + (e.sch ? PTS.sch : 0); }
  function nbQ(e) { return 8 + (e.ddl != null ? 1 : 0) + (e.sch ? 1 : 0); }
  function ok12(i) {
    var e = ET[i], s = st[i];
    return s.v.every(function (v, j) { return v === e.mob[j]; }) && s.nom === e.nom && s.axe === e.axe && (e.ddl == null || s.ddl === e.ddl);
  }
  function pts(i) {
    var e = ET[i], s = st[i], p = 0;
    s.v.forEach(function (v, j) { if (v === e.mob[j]) p += PTS.mob; });
    if (e.ddl != null && s.ddl === e.ddl) p += PTS.ddl;
    if (s.nom === e.nom) p += PTS.nom;
    if (s.axe === e.axe) p += PTS.axe;
    if (e.sch && s.sch != null && e.sch[s.sch][3]) p += PTS.sch;
    return p;
  }
  function answered(i) { var s = st[i], e = ET[i]; return s.nom && s.axe && (e.ddl == null || s.ddl != null); }
  // la correction d'une étude se montre en entraînement après validation, en examen après la remise
  function show12(i) { return mode === "exam" ? rendu : st[i].val12; }
  function show3(i) { return mode === "exam" ? rendu : st[i].val3; }
  function locked(i) { return mode === "exam" ? rendu : st[i].val12; }

  function showImage(id) {
    if (curImg === id) return;
    curImg = id;
    var im = D.images[id], r = im.rep;
    $("#fig-img").src = im.src; $("#fig-img").width = im.w; $("#fig-img").height = im.h; $("#fig-img").alt = im.alt;
    $("#ov").setAttribute("viewBox", "0 0 " + im.w + " " + im.h);
    if (!r) { $("#fig-rep").innerHTML = ""; $("#fig-rep").className = ""; return; }
    var rep = '<svg class="eo-rep" viewBox="0 0 100 90" role="img" aria-label="' + r.label + '">';
    r.axes.forEach(function (a) {
      if (a[1] === 0 && a[2] === 0) rep += '<circle cx="30" cy="60" r="7" class="o"/><circle cx="30" cy="60" r="2" class="pt"/><text x="12" y="84">' + a[0] + "</text>";
      else rep += '<line x1="30" y1="60" x2="' + (30 + a[1]) + '" y2="' + (60 + a[2]) + '" marker-end="url(#rp)"/><text x="' +
        (30 + a[1] * 1.25 - 4) + '" y="' + (60 + a[2] * 1.25 + 5) + '">' + a[0] + "</text>";
    });
    rep += '<defs><marker id="rp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10z"/></marker></defs></svg>';
    $("#fig-rep").innerHTML = rep;
    $("#fig-rep").className = "rep-pos " + (r.pos || "bl");
  }
  function zones(list, cls, img) {
    return (list || []).map(function (k) { return '<path class="' + cls + '" d="' + D.images[img].zones[k] + '"/>'; }).join("");
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
    if (!e.R) return;
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
  function cls(show, good, picked) { return show ? (good ? " good" : (picked ? " bad" : "")) : (picked && mode === "exam" ? " picked" : ""); }

  function tabs() {
    $$("#tabs button").forEach(function (b, i) {
      b.setAttribute("aria-selected", i === cur ? "true" : "false");
      var done = mode === "exam" ? answered(i) : st[i].val12 && (!ET[i].sch || st[i].val3);
      b.classList.toggle("fini", done && !(mode === "exam" && rendu));
      b.classList.toggle("juste", show12(i) && ok12(i) && (!ET[i].sch || show3(i)));
      b.classList.toggle("faux", show12(i) && !ok12(i));
    });
  }

  function render() {
    var e = ET[cur], s = st[cur], sh = show12(cur), lk = locked(cur);
    overlay(cur); tabs();
    var table = '<table class="mob"><thead><tr><th colspan="3">Translation</th><th colspan="3">Rotation</th></tr><tr>' +
      MVT.map(function (m) { return "<th>" + m + "</th>"; }).join("") + "</tr></thead><tbody><tr>" +
      s.v.map(function (v, i) {
        return '<td class="' + (sh ? (v === e.mob[i] ? "g-ok" : "g-ko") : "") + '"><button type="button" class="mob-g" data-i="' + i + '" data-v="' + v + '"' +
          (lk ? " disabled" : "") + ' aria-label="' + MVT[i] + " : " + v + '">' + v + "</button></td>";
      }).join("") + "</tr></tbody></table>";
    var ddl = e.ddl == null ? "" : '<div class="ddls"><span>Nombre de degrés de liberté :</span>' + [0, 1, 2, 3, 4, 5, 6].map(function (n) {
      return '<button type="button" class="ddl-b' + cls(sh, n === e.ddl, s.ddl === n) + '" data-n="' + n + '" aria-pressed="' + (s.ddl === n) + '"' + (lk ? " disabled" : "") + ">" + n + "</button>";
    }).join("") + "</div>";
    var noms = NOMS.map(function (n) {
      return '<label class="nm' + cls(sh, n === e.nom, s.nom === n) + '"><input type="radio" name="nom" value="' + n + '"' + (s.nom === n ? " checked" : "") +
        (lk ? " disabled" : "") + "> " + n + "</label>";
    }).join("");
    var axes = ["x", "y", "z", "-"].map(function (a) {
      return '<label class="ax' + cls(sh, a === e.axe, s.axe === a) + '"><input type="radio" name="axe" value="' + a + '"' + (s.axe === a ? " checked" : "") +
        (lk ? " disabled" : "") + "> " + (a === "-" ? "sans axe" : a) + "</label>";
    }).join("");
    var q3 = "";
    if (e.sch) {
      var order = [1, 3, 0, 2].map(function (k) { return (k + cur) % 4; }), s3 = show3(cur), open3 = mode === "exam" ? !rendu : s.val12 && !s.val3;
      q3 = '<section class="q' + (open3 || s3 ? "" : " locked") + '"><h3><span class="qn">' + (e.ddl != null ? 4 : 3) +
        "</span> Par quel dessin représente-t-on cette liaison dans le plan " + e.plan + " ?</h3>" +
        (mode !== "exam" && !s.val12 ? '<p class="lock">Réponds d\'abord aux questions précédentes.</p>' : "") + '<div class="schs">' +
        order.map(function (k) {
          return '<button type="button" class="sch-opt' + cls(s3, e.sch[k][3], s.sch === k) + '" data-k="' + k + '"' + (open3 ? "" : " disabled") +
            ' aria-label="Schéma ' + (order.indexOf(k) + 1) + '">' + schemaHTML(e.sch[k]) + "</button>";
        }).join("") + "</div>" +
        (s3 && s.sch != null ? '<p class="fb ' + (e.sch[s.sch][3] ? "ok" : "ko") + '">' + (e.sch[s.sch][3] ? "✔ Bon schéma." :
          "✘ Ce n'est pas le bon schéma : vérifie le type de liaison et l'orientation de son axe dans le plan " + e.plan + ".") + "</p>" : "") + "</section>";
    }
    var qn = e.ddl != null ? 3 : 2;
    var consigne = e.rN ? 'On s\'intéresse à la liaison de <b class="r">' + e.rN + '</b> avec <b class="b">' + e.bN + "</b>." : e.consigne;
    $("#etude").innerHTML =
      '<p class="kicker">' + (e.sys ? e.sys + " · " : "") + "étude " + (cur + 1) + " / " + ET.length + "</p>" +
      "<h2>" + e.titre + "</h2>" +
      '<p class="consigne">' + consigne + (e.note ? ' <span class="small">' + e.note + "</span>" : "") + "</p>" +
      '<section class="q"><h3><span class="qn">1</span> Remplis le tableau des mobilités</h3><p class="small">Clique sur une case pour passer de 0 à 1.</p>' + table + "</section>" +
      (ddl ? '<section class="q"><h3><span class="qn">2</span> Combien cette liaison a-t-elle de degrés de liberté ?</h3>' + ddl + "</section>" : "") +
      '<section class="q"><h3><span class="qn">' + qn + '</span> Quel est le nom de cette liaison ? Quel est son axe' +
      (e.nom === "Appui plan" || e.nom === "Ponctuelle" ? " (sa normale)" : "") + ' ?</h3><div class="noms">' + noms +
      '</div><div class="axes"><span>Axe :</span>' + axes + "</div>" +
      (mode === "exam" || s.val12 ? "" : '<button type="button" class="btn" id="val12">Valider</button>') +
      '<p class="warn" id="warn" aria-live="polite"></p></section>' +
      (sh ? '<div class="fb ' + (ok12(cur) ? "ok" : "ko") + '"><p><strong>' + (ok12(cur) ? "✔ " : "✘ ") + "Correction :</strong> " +
        nomComplet(e.nom, e.axe).toLowerCase() + (e.ddl != null ? " — " + e.ddl + " ddl" : "") + ".</p>" + (e.why || "") +
        (e.R ? '<button type="button" class="btn ghost" id="voir">▶ Voir le mouvement</button>' : "") + "</div>" : "") +
      q3 +
      '<div class="nav">' + (cur > 0 ? '<button type="button" class="btn ghost" id="prev">◀ Précédente</button>' : "") +
      (cur < ET.length - 1 ? '<button type="button" class="btn" id="next">Étude suivante ▶</button>'
        : (mode === "exam" && !rendu ? '<button type="button" class="btn btn-ex" id="rendre">J\'ai fini, je rends ma copie</button>'
          : '<button type="button" class="btn" id="bilan-btn">Voir le bilan ▶</button>')) + "</div>";

    $$(".mob-g").forEach(function (b) { b.addEventListener("click", function () { var i = +b.getAttribute("data-i"); s.v[i] = s.v[i] ? 0 : 1; render(); }); });
    $$(".ddl-b").forEach(function (b) { b.addEventListener("click", function () { s.ddl = +b.getAttribute("data-n"); render(); }); });
    $$('input[name="nom"]').forEach(function (r) { r.addEventListener("change", function () { s.nom = r.value; tabs(); }); });
    $$('input[name="axe"]').forEach(function (r) { r.addEventListener("change", function () { s.axe = r.value; tabs(); }); });
    var v12 = $("#val12");
    if (v12) v12.addEventListener("click", function () {
      if (!answered(cur)) { $("#warn").textContent = "Réponds à toutes les questions (nom, axe" + (e.ddl != null ? ", nombre de ddl" : "") + ") avant de valider."; return; }
      s.val12 = true; score(); render(); play(cur);
    });
    var voir = $("#voir"); if (voir) voir.addEventListener("click", function () { play(cur); });
    $$(".sch-opt").forEach(function (b) {
      b.addEventListener("click", function () {
        s.sch = +b.getAttribute("data-k");
        if (mode !== "exam") s.val3 = true;
        score(); render();
      });
    });
    function go(i) { cur = i; render(); var t = $("#tabs"); if (t.getBoundingClientRect().top < 0) window.scrollTo(0, t.offsetTop - 8); }
    var pv = $("#prev"); if (pv) pv.addEventListener("click", function () { go(cur - 1); });
    var nx = $("#next"); if (nx) nx.addEventListener("click", function () { go(cur + 1); });
    var bl = $("#bilan-btn"); if (bl) bl.addEventListener("click", bilan);
    var rd = $("#rendre"); if (rd) rd.addEventListener("click", rendre);
  }

  function rendre() {
    var vides = ET.filter(function (e, i) { return !answered(i); }).length;
    var b = $("#rendre");
    if (!b.classList.contains("confirm")) {
      b.classList.add("confirm");
      b.textContent = vides ? "Confirmer : " + vides + " étude" + (vides > 1 ? "s" : "") + " incomplète" + (vides > 1 ? "s" : "") + ", je rends quand même" : "Confirmer la remise de ma copie";
      return;
    }
    rendu = true; clearInterval(tick); score(); bilan();
  }

  function note() {
    var p = 0, m = 0;
    ET.forEach(function (e, i) {
      m += maxPts(e);
      if (mode === "exam" ? rendu : st[i].val12) p += pts(i);
    });
    return p / m * 20;
  }
  function score() {
    var done = 0, tot = 0;
    ET.forEach(function (e, i) {
      tot += nbQ(e);
      if (mode === "exam" ? answered(i) : st[i].val12) done += nbQ(e) - (e.sch ? 1 : 0);
      if (e.sch && st[i].sch != null) done += 1;
    });
    $("#sc-q").textContent = done + " / " + tot;
    $("#sc-n").textContent = mode === "exam" && !rendu ? "après la remise" : note().toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " / 20";
  }
  function chrono() {
    var sec = Math.floor((Date.now() - t0) / 1000);
    $("#sc-t").textContent = Math.floor(sec / 60) + " min " + ("0" + sec % 60).slice(-2) + " s" + (D.minutes ? " (conseillé : " + D.minutes + " min)" : "");
  }

  // bilan : tableau des études et, si le système en a un, graphe des liaisons construit avec les réponses
  function bilan() {
    var G = D.graphe, h = "";
    if (G) {
      var N = G.nodes;
      h += '<svg viewBox="0 0 ' + G.w + " " + G.h + '" class="graphe" role="img" aria-label="Graphe des liaisons">';
      G.edges.forEach(function (ed) {
        var a = N[ed[0]], b = N[ed[1]], i = ed[2], s = st[i], ok = ok12(i);
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, c = ok ? "gg" : "gk";
        h += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" class="' + c + '"/>' +
          '<rect x="' + (mx - 68) + '" y="' + (my - 11) + '" width="136" height="22" rx="11" class="lb ' + c + '"/><text x="' + mx + '" y="' + (my + 4) + '">' + nomComplet(s.nom, s.axe) + "</text>";
      });
      Object.keys(N).forEach(function (k) {
        var n = N[k];
        h += '<ellipse cx="' + n[0] + '" cy="' + n[1] + '" rx="58" ry="20" class="nd"/><text x="' + n[0] + '" y="' + (n[1] + 5) + '" class="nt">' + n[2] + "</text>";
      });
      h += "</svg>";
    }
    var rows = ET.map(function (e, i) {
      var p = pts(i), m = maxPts(e);
      return '<tr class="' + (p === m ? "r-ok" : "r-ko") + '"><td>' + (i + 1) + "</td><td>" + (e.sys ? e.sys + " — " : "") + e.titre + "</td><td>" +
        nomComplet(st[i].nom, st[i].axe) + "</td><td>" + nomComplet(e.nom, e.axe) + "</td><td>" + p.toLocaleString("fr-FR") + " / " + m + "</td></tr>";
    }).join("");
    $("#etude").innerHTML = "<h2>Bilan</h2>" +
      (G ? "<p>Le graphe des liaisons, avec <strong>tes</strong> réponses (vert : juste, rouge : à revoir).</p>" + h : "") +
      '<div class="recap-wrap"><table class="t bilan-t"><thead><tr><th>#</th><th>Étude</th><th>Ta réponse</th><th>Attendu</th><th>Points</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      (D.retenir ? '<div class="retenir"><p><strong>À retenir :</strong> ' + D.retenir + "</p></div>" : "") +
      '<p class="note-fin">Note : <b>' + note().toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " / 20</b>" + (mode === "exam" ? " · " + $("#sc-t").textContent : "") + "</p>" +
      '<div class="nav"><button type="button" class="btn ghost" id="back">◀ Revoir les études</button> <button type="button" class="btn ghost" id="print">Imprimer</button>' +
      ' <a class="btn ghost" href="' + (D.retour || "index.html") + '">' + (D.retourTxt || "Accueil") + "</a></div>";
    $("#ov-static").innerHTML = "";
    showImage(D.bilanImg || ET[0].img);
    $("#back").addEventListener("click", function () { cur = 0; render(); });
    $("#print").addEventListener("click", function () { window.print(); });
    $$("#tabs button").forEach(function (b) { b.setAttribute("aria-selected", "false"); });
  }

  function start(m) {
    mode = m;
    document.body.classList.add("mode-" + m);
    $("#modes").hidden = true; $("#travail").hidden = false;
    $("#mode-lab").textContent = m === "exam" ? "Mode examen" : "Mode entraînement";
    t0 = Date.now(); chrono(); tick = setInterval(chrono, 1000);
    score(); render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("#tabs").innerHTML = ET.map(function (e, i) {
      var lab = D.compact ? String(i + 1) : (i + 1) + ". " + e.titre;
      return '<button type="button" role="tab" data-i="' + i + '" title="' + (e.sys ? e.sys + " — " : "") + e.titre + '">' + lab + "</button>";
    }).join("");
    $("#tabs").classList.toggle("compact", !!D.compact);
    $$("#tabs button").forEach(function (b) { b.addEventListener("click", function () { cur = +b.getAttribute("data-i"); render(); }); });
    $$("[data-mode]").forEach(function (b) { b.addEventListener("click", function () { start(b.getAttribute("data-mode")); }); });
    var h = (location.hash || "").slice(1);
    if (h === "examen") start("exam"); else if (h === "entrainement") start("training");
  });
  window.__ETUDES__ = { ETUDES: ET, st: st, note: note, start: start };
})();
