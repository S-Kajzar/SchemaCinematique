/* Exercice 2 (prototype) — L'éolienne : étude de toutes ses liaisons.
   Dépend de SCHEMAS (src/cours/schemas.js). Repère : x vers la droite, y vers le haut, z vers l'observateur. */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var MVT = ["Tx", "Ty", "Tz", "Rx", "Ry", "Rz"];
  var NOMS = ["Encastrement", "Pivot", "Glissière", "Pivot glissant", "Hélicoïdale", "Appui plan",
              "Rotule", "Rotule à doigt", "Linéaire rectiligne", "Linéaire annulaire", "Ponctuelle"];

  // zones de l'image (coordonnées de l'image d'origine, 465 × 541)
  var Z = {
    paleH: "M174 37 Q183 40 182 60 L181 156 L171 159 Q164 120 170 60 Q170 40 174 37Z",
    paleB: "M171 231 L181 229 L182 350 Q182 370 176 371 Q168 352 167 300 Z",
    moyeu: "M188 186 L152 186 Q131 190 131 204 Q132 219 152 222 L188 222Z",
    nacelle: "M192 185 L312 188 Q329 194 328 206 Q325 218 302 221 L250 222 L250 234 L218 234 L218 222 L192 222Z",
    mat: "M226 234 L250 234 L250 466 L261 466 L261 495 L226 495Z",
    fondation: "M173 493 L298 493 L298 503 L318 503 L318 523 L153 523 L153 503 L173 503Z"
  };
  // R : pièce étudiée (rouge), B : pièce de référence (bleue) ; anim : mouvement à rejouer sur l'image
  var ETUDES = [
    { titre: "Rotor / nacelle", R: ["paleH", "paleB", "moyeu"], B: ["nacelle"], rN: "le rotor (pales + moyeu)", bN: "la nacelle",
      mob: [0, 0, 0, 1, 0, 0], nom: "Pivot", axe: "x",
      anim: { kf: "scaleY", ox: 160, oy: 204 },
      why: "Le rotor tourne autour de l'arbre horizontal de la nacelle (axe x) : c'est son seul mouvement, le vent fait tourner les pales.",
      sch: [["pivot", 0, 0, true], ["pivot", 0, 90], ["pivot", 1, 0], ["glissiere", 0, 0]] },
    { titre: "Nacelle / mât", R: ["nacelle", "moyeu", "paleH", "paleB"], B: ["mat"], rN: "la nacelle (avec le rotor)", bN: "le mât",
      mob: [0, 0, 0, 0, 1, 0], nom: "Pivot", axe: "y",
      anim: { kf: "scaleX", ox: 238, oy: 230 },
      why: "La nacelle s'oriente face au vent en tournant autour de l'axe vertical du mât (axe y) : c'est l'orientation, ou « yaw ».",
      sch: [["pivot", 0, 0], ["pivot", 0, 90, true], ["pivot", 1, 0], ["pivot-glissant", 0, 90]] },
    { titre: "Pale / moyeu", R: ["paleH"], B: ["moyeu"], rN: "la pale du haut", bN: "le moyeu",
      mob: [0, 0, 0, 0, 1, 0], nom: "Pivot", axe: "y",
      anim: { kf: "scaleX", ox: 176, oy: 100 },
      why: "Chaque pale peut tourner sur elle-même pour régler son angle face au vent (le « calage » ou « pitch ») : pivot d'axe y pour la pale du haut.",
      sch: [["rotule", 0, 0], ["pivot", 0, 90, true], ["pivot", 1, 0], ["glissiere", 0, 90]] },
    { titre: "Mât / fondation", R: ["mat"], B: ["fondation"], rN: "le mât", bN: "la fondation",
      mob: [0, 0, 0, 0, 0, 0], nom: "Encastrement", axe: "-",
      anim: null,
      why: "Le mât est boulonné sur la fondation en béton : aucun mouvement possible, c'est un encastrement. Mât et fondation forment un seul bloc.",
      sch: [["encastrement", 0, 0, true], ["rotule", 0, 0], ["appui-plan", 0, 0], ["pivot", 1, 0]] }
  ];
  var PTS = { mob: 0.5, nom: 2, axe: 1, sch: 1 }; // 7 points par étude
  var st = ETUDES.map(function () { return { v: [0, 0, 0, 0, 0, 0], done12: false, done3: false, pts: 0, nomRep: null, axeRep: null }; });
  var cur = 0;

  function overlay(i) {
    var e = ETUDES[i];
    function paths(list, cls) { return list.map(function (k) { return '<path class="' + cls + '" d="' + Z[k] + '"/>'; }).join(""); }
    $("#ov-static").innerHTML = paths(e.B, "zb") + paths(e.R, "zr");
    $("#ov-move").innerHTML = "";
    $("#ov-move").removeAttribute("style");
  }
  function play(i) {
    var e = ETUDES[i], g = $("#ov-move"), svg = $("#ov");
    if (g._a) g._a.cancel();
    if (!e.anim) { svg.classList.remove("blocked"); void svg.offsetWidth; svg.classList.add("blocked"); return; }
    g.innerHTML = e.R.map(function (k) { return '<path class="zm" d="' + Z[k] + '"/>'; }).join("");
    g.style.transformOrigin = e.anim.ox + "px " + e.anim.oy + "px";
    var f = e.anim.kf, kf = [];
    for (var t = 0; t <= 24; t++) { var c = Math.cos(t / 24 * 2 * Math.PI); kf.push({ transform: f + "(" + c.toFixed(3) + ")" }); }
    g._a = g.animate(kf, { duration: 2600, iterations: 2 });
    g._a.onfinish = function () { g.innerHTML = ""; };
  }

  function schemaHTML(s) {
    var v = SCHEMAS[s[0]][s[1]].svg;
    return '<div class="sch-in" style="transform:rotate(' + -s[2] + 'deg)">' + v + "</div>";
  }

  function render() {
    var e = ETUDES[cur], s = st[cur];
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
      var chk = s.nomRep === n ? " checked" : "", cls = s.done12 ? (n === e.nom ? " good" : (s.nomRep === n ? " bad" : "")) : "";
      return '<label class="nm' + cls + '"><input type="radio" name="nom" value="' + n + '"' + chk + (s.done12 ? " disabled" : "") + "> " + n + "</label>";
    }).join("");
    var axes = ["x", "y", "z", "-"].map(function (a) {
      var cls = s.done12 ? (a === e.axe ? " good" : (s.axeRep === a ? " bad" : "")) : "";
      return '<label class="ax' + cls + '"><input type="radio" name="axe" value="' + a + '"' + (s.axeRep === a ? " checked" : "") + (s.done12 ? " disabled" : "") +
        "> " + (a === "-" ? "sans axe" : a) + "</label>";
    }).join("");
    var order = [1, 3, 0, 2].map(function (k) { return (k + cur) % 4; });
    var sch = order.map(function (k) {
      var o = e.sch[k], cls = s.done3 ? (o[3] ? " good" : (s.schRep === k ? " bad" : "")) : "";
      return '<button type="button" class="sch-opt' + cls + '" data-k="' + k + '"' + (s.done3 || !s.done12 ? " disabled" : "") + ">" + schemaHTML(o) + "</button>";
    }).join("");
    $("#etude").innerHTML =
      '<h2>Étude ' + (cur + 1) + " — " + e.titre + "</h2>" +
      '<p class="consigne">On s\'intéresse à la liaison de <b class="r">' + e.rN + '</b> avec <b class="b">' + e.bN + "</b>.</p>" +
      '<section class="q"><h3><span class="qn">1</span> Remplis le tableau des mobilités</h3><p class="small">Clique sur une case pour passer de 0 à 1.</p>' + table + "</section>" +
      '<section class="q"><h3><span class="qn">2</span> Quel est le nom de cette liaison ? Quel est son axe ?</h3><div class="noms">' + noms + '</div><div class="axes"><span>Axe :</span>' + axes + "</div>" +
      (s.done12 ? "" : '<button type="button" class="btn" id="val12">Valider les questions 1 et 2</button>') + "</section>" +
      (s.done12 ? '<div class="fb ' + (s.ok12 ? "ok" : "ko") + '"><p><strong>' + (s.ok12 ? "✔ " : "✘ ") + "Correction :</strong> " + e.nom.toLowerCase() +
        (e.axe !== "-" ? " d'axe " + e.axe : "") + ". " + e.why + '</p><button type="button" class="btn ghost" id="voir">▶ Voir le mouvement sur l\'éolienne</button></div>' : "") +
      '<section class="q' + (s.done12 ? "" : " locked") + '"><h3><span class="qn">3</span> Par quel dessin représente-t-on cette liaison dans le plan (O, x, y) ?</h3>' +
      (s.done12 ? "" : '<p class="lock">Réponds d\'abord aux questions 1 et 2.</p>') + '<div class="schs">' + sch + "</div>" +
      (s.done3 ? '<p class="fb ' + (e.sch[s.schRep][3] ? "ok" : "ko") + '">' + (e.sch[s.schRep][3] ? "✔ Bon schéma." : "✘ Ce n'est pas le bon schéma : regarde l'orientation de l'axe dans le plan (O, x, y).") + "</p>" : "") + "</section>" +
      '<div class="nav">' + (cur < ETUDES.length - 1 ? '<button type="button" class="btn" id="next">Étude suivante ▶</button>' : '<button type="button" class="btn" id="bilan-btn">Voir le bilan ▶</button>') + "</div>";

    $$(".mob-g").forEach(function (b) {
      b.addEventListener("click", function () { var i = +b.getAttribute("data-i"); s.v[i] = s.v[i] ? 0 : 1; render(); });
    });
    $$('input[name="nom"]').forEach(function (r) { r.addEventListener("change", function () { s.nomRep = r.value; }); });
    $$('input[name="axe"]').forEach(function (r) { r.addEventListener("change", function () { s.axeRep = r.value; }); });
    var v12 = $("#val12");
    if (v12) v12.addEventListener("click", function () {
      if (!s.nomRep || !s.axeRep) { alert("Choisis un nom de liaison et un axe avant de valider."); return; }
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
    var nx = $("#next"); if (nx) nx.addEventListener("click", function () { cur++; render(); });
    var bl = $("#bilan-btn"); if (bl) bl.addEventListener("click", bilan);
  }

  function score() {
    var done = st.reduce(function (a, s) { return a + (s.done12 ? 8 : 0) + (s.done3 ? 1 : 0); }, 0);
    var pts = st.reduce(function (a, s) { return a + s.pts; }, 0), max = ETUDES.length * 7;
    $("#sc-q").textContent = done + " / " + ETUDES.length * 9;
    $("#sc-n").textContent = (pts / max * 20).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " / 20";
  }

  // bilan : graphe des liaisons construit à partir des réponses de l'élève
  function bilan() {
    var N = { fondation: [70, 210, "Fondation"], mat: [70, 120, "Mât"], nacelle: [230, 60, "Nacelle"], moyeu: [390, 120, "Moyeu"], pale: [390, 210, "Pale"] };
    var E = [["mat", "fondation", 3], ["nacelle", "mat", 1], ["moyeu", "nacelle", 0], ["pale", "moyeu", 2]];
    var svg = '<svg viewBox="0 0 460 250" class="graphe" role="img" aria-label="Graphe des liaisons de l\'éolienne">';
    E.forEach(function (ed) {
      var a = N[ed[0]], b = N[ed[1]], e = ETUDES[ed[2]], s = st[ed[2]];
      var ok = s.done12 && s.nomRep === e.nom && s.axeRep === e.axe;
      var lab = s.done12 ? s.nomRep + (s.axeRep !== "-" ? " d'axe " + s.axeRep : "") : "?";
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      svg += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" class="' + (ok ? "gg" : "gk") + '"/>' +
        '<rect x="' + (mx - 66) + '" y="' + (my - 11) + '" width="132" height="22" rx="11" class="lb ' + (ok ? "gg" : "gk") + '"/><text x="' + mx + '" y="' + (my + 4) + '">' + lab + "</text>";
    });
    Object.keys(N).forEach(function (k) {
      var n = N[k];
      svg += '<ellipse cx="' + n[0] + '" cy="' + n[1] + '" rx="50" ry="20" class="nd"/><text x="' + n[0] + '" y="' + (n[1] + 5) + '" class="nt">' + n[2] + "</text>";
    });
    svg += "</svg>";
    $("#etude").innerHTML = "<h2>Bilan — le graphe des liaisons</h2>" +
      "<p>Chaque ellipse est une pièce, chaque trait une liaison, avec <strong>ta</strong> réponse (vert : juste, rouge : à revoir).</p>" + svg +
      '<div class="retenir"><p><strong>À retenir :</strong> le mât et la fondation sont encastrés : ils ne forment qu\'une seule ' +
      "<strong>classe d'équivalence</strong> (un seul bloc). L'éolienne se ramène donc à une chaîne de 3 pivots : orientation de la nacelle (y), " +
      "rotation du rotor (x) et calage de chaque pale.</p></div>" +
      '<p class="note-fin">Note : <b>' + $("#sc-n").textContent + "</b></p>" +
      '<div class="nav"><button type="button" class="btn ghost" id="back">◀ Revenir aux études</button> <button type="button" class="btn ghost" onclick="window.print()">Imprimer</button></div>';
    $("#ov-static").innerHTML = "";
    $("#back").addEventListener("click", function () { cur = 0; render(); });
    $$("#tabs button").forEach(function (b) { b.setAttribute("aria-selected", "false"); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("#tabs").innerHTML = ETUDES.map(function (e, i) { return '<button type="button" role="tab" data-i="' + i + '">' + (i + 1) + ". " + e.titre + "</button>"; }).join("");
    $$("#tabs button").forEach(function (b) { b.addEventListener("click", function () { cur = +b.getAttribute("data-i"); render(); }); });
    score(); render();
  });
  window.__EOLIENNE__ = { ETUDES: ETUDES, st: st };
})();
