/* Cours 1.1 — Les liaisons mécaniques (niveau 1) : moteur de la page.
   Dépend de SCHEMAS (schemas.js) et de window.__IMG__ (images intégrées par le générateur). */
(function () {
  "use strict";
  var IMG = window.__IMG__ || {};
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MVT = ["Tx", "Ty", "Tz", "Rx", "Ry", "Rz"];
  var AX = ["x", "y", "z"];

  /* ------------------------------------------------------------------ les 11 liaisons
     mob : mobilités dans le repère de l'exemple (Tx Ty Tz Rx Ry Rz), 1 = possible.
     main : axe caractéristique dans ce repère ; kind : « axe », « normale », « doigt » ou rien. */
  var LIAISONS = [
    { id: "encastrement", nom: "Encastrement", alias: "ou liaison fixe", mob: [0, 0, 0, 0, 0, 0],
      contact: "Les deux pièces sont assemblées de façon rigide (vissées, soudées, collées…).",
      vie: "Deux pièces vissées ou soudées, une poignée de porte fixée sur la porte.",
      desc: "Aucun mouvement possible : les deux pièces ne forment plus qu'un seul bloc." },
    { id: "pivot", nom: "Pivot", mob: [0, 0, 0, 1, 0, 0], main: 0, kind: "axe",
      contact: "Contact cylindrique, avec deux arrêts qui empêchent le glissement le long de l'axe.",
      vie: "Roue de vélo sur son axe, charnière de porte, hélice d'avion.",
      desc: "Une seule rotation, autour de l'axe de la liaison." },
    { id: "pivot-glissant", nom: "Pivot glissant", mob: [1, 0, 0, 1, 0, 0], main: 0, kind: "axe",
      contact: "Contact cylindre dans cylindre : surface cylindrique.",
      vie: "Piston dans son cylindre, tige de vérin, barre de musculation dans ses bagues.",
      desc: "Une translation et une rotation suivant le même axe, indépendantes l'une de l'autre." },
    { id: "glissiere", nom: "Glissière", mob: [1, 0, 0, 0, 0, 0], main: 0, kind: "axe",
      contact: "Contact entre formes prismatiques (section carrée, cannelures…) : la rotation est empêchée.",
      vie: "Tiroir dans un meuble, tiroir de caisse, coulisseau de toboggan.",
      desc: "Une seule translation, le long de l'axe de la liaison." },
    { id: "appui-plan", nom: "Appui plan", mob: [1, 1, 0, 0, 0, 1], main: 2, kind: "normale",
      contact: "Contact plan sur plan : surface plane.",
      vie: "Fer à repasser sur la planche, souris sur son tapis, livre posé sur une table.",
      desc: "Deux translations dans le plan et une rotation autour de la normale au plan." },
    { id: "lineaire-rectiligne", nom: "Linéaire rectiligne", mob: [1, 1, 0, 1, 0, 1], main: 2, kind: "normale", line: 0,
      contact: "Contact cylindre sur plan : une ligne droite.",
      vie: "Rouleau à pâtisserie sur la table, rouleau compresseur sur la route.",
      desc: "Deux translations dans le plan, une rotation autour de la normale et une autour de la ligne de contact." },
    { id: "ponctuelle", nom: "Ponctuelle", alias: "ou sphère-plan", mob: [1, 1, 0, 1, 1, 1], main: 2, kind: "normale",
      contact: "Contact sphère sur plan : un point.",
      vie: "Bille sur une table, pointe de stylo à bille sur la feuille, pied de chaise sur le sol.",
      desc: "Tout est possible sauf s'enfoncer dans le plan ou s'en décoller : 5 degrés de liberté." },
    { id: "lineaire-annulaire", nom: "Linéaire annulaire", alias: "ou sphère-cylindre", mob: [1, 0, 0, 1, 1, 1], main: 0, kind: "axe",
      contact: "Contact sphère dans cylindre : un cercle.",
      vie: "Bille dans un tube, piston de seringue légèrement penché.",
      desc: "La sphère glisse le long du cylindre et tourne dans tous les sens." },
    { id: "rotule", nom: "Rotule", alias: "ou sphérique", mob: [0, 0, 0, 1, 1, 1], main: null, kind: "centre",
      contact: "Contact sphère dans sphère : surface sphérique.",
      vie: "Rétroviseur de voiture, boule d'attelage de remorque, épaule.",
      desc: "Trois rotations autour du centre de la sphère, aucune translation." },
    { id: "rotule-a-doigt", nom: "Rotule à doigt", alias: "ou sphérique à doigt", mob: [0, 0, 0, 1, 1, 0], main: 2, kind: "doigt",
      contact: "Rotule dont un doigt, glissant dans une rainure, bloque une rotation.",
      vie: "Manette de jeu (joystick), levier de commande.",
      desc: "Comme la rotule, mais le doigt empêche de tourner autour d'un axe : il reste 2 rotations." },
    { id: "helicoidale", nom: "Hélicoïdale", mob: [1, 0, 0, 1, 0, 0], main: 0, kind: "axe", combine: true,
      contact: "Contact entre filets : une vis dans un écrou.",
      vie: "Serre-joint, étau, tire-bouchon, bouchon vissé sur une bouteille.",
      desc: "La vis avance en tournant : translation et rotation sont liées, il n'y a qu'un seul degré de liberté." }
  ];
  var BY = {}; LIAISONS.forEach(function (l) { BY[l.id] = l; });
  function ddl(l) { return l.combine ? 1 : l.mob.reduce(function (a, b) { return a + b; }, 0); }
  function nT(l) { return l.mob[0] + l.mob[1] + l.mob[2]; }
  function nR(l) { return l.mob[3] + l.mob[4] + l.mob[5]; }
  // décalage circulaire des axes : k = 1 → x devient y, y devient z, z devient x
  function permute(mob, k) {
    var o = [0, 0, 0, 0, 0, 0];
    for (var i = 0; i < 3; i++) { o[(i + k) % 3] = mob[i]; o[3 + (i + k) % 3] = mob[3 + i]; }
    return o;
  }
  function fullName(l, k) {
    k = k || 0;
    if (l.kind === "axe") return l.nom + " d'axe " + AX[(l.main + k) % 3];
    if (l.kind === "normale" && l.id === "lineaire-rectiligne")
      return l.nom + " de normale " + AX[(l.main + k) % 3] + " et de ligne " + AX[(l.line + k) % 3];
    if (l.kind === "normale") return l.nom + " de normale " + AX[(l.main + k) % 3];
    if (l.kind === "doigt") return l.nom + " (rotation R" + AX[(l.main + k) % 3] + " bloquée)";
    if (l.kind === "centre") return l.nom + " de centre O";
    return l.nom;
  }
  function mobTable(mob, opts) {
    opts = opts || {};
    var h = '<table class="mob' + (opts.cls ? " " + opts.cls : "") + '"><thead><tr><th colspan="3">Translation</th><th colspan="3">Rotation</th></tr><tr>' +
      MVT.map(function (m) { return "<th>" + m + "</th>"; }).join("") + "</tr></thead><tbody><tr>";
    h += mob.map(function (v, i) {
      if (opts.guess) return '<td><button type="button" class="mob-g" data-i="' + i + '" data-v="0" aria-label="' + MVT[i] + ' : 0">0</button></td>';
      return '<td class="' + (v ? "v1" : "v0") + '">' + v + "</td>";
    }).join("");
    if (opts.combine) h += "</tr><tr><td colspan=\"6\" class=\"mob-comb\">Tx et Rx combinées : 1 seul degré de liberté</td>";
    return h + "</tr></tbody></table>";
  }

  /* ------------------------------------------------------------------ animation des schémas plans */
  var ANIMS = {
    rot: [{ transform: "rotate(0deg)" }, { transform: "rotate(40deg)" }, { transform: "rotate(-40deg)" }, { transform: "rotate(0deg)" }],
    tx: [{ transform: "translateX(0)" }, { transform: "translateX(16px)" }, { transform: "translateX(-16px)" }, { transform: "translateX(0)" }],
    ty: [{ transform: "translateY(0)" }, { transform: "translateY(-22px)" }, { transform: "translateY(22px)" }, { transform: "translateY(0)" }],
    rock: [{ transform: "rotate(0deg)" }, { transform: "rotate(22deg)" }, { transform: "rotate(-22deg)" }, { transform: "rotate(0deg)" }],
    roll: [{ transform: "translateX(0) rotate(0deg)" }, { transform: "translateX(18px) rotate(-52deg)" }, { transform: "translateX(-18px) rotate(52deg)" }, { transform: "translateX(0) rotate(0deg)" }],
    screw: [{ transform: "translateX(0)" }, { transform: "translateX(8px)" }, { transform: "translateX(-8px)" }, { transform: "translateX(0)" }]
  };
  function animate(svgEl, on) {
    var g = svgEl.querySelector(".s2");
    if (g._a) { g._a.cancel(); g._a = null; }
    svgEl.classList.remove("blocked");
    if (!on) return;
    var t = g.getAttribute("data-anim");
    if (!t || !g.animate) { svgEl.classList.add("blocked"); setTimeout(function () { svgEl.classList.remove("blocked"); }, 700); return; }
    g._a = g.animate(ANIMS[t], { duration: t === "screw" ? 1800 : 2400, iterations: REDUCE ? 1 : Infinity, easing: "ease-in-out" });
  }

  /* ------------------------------------------------------------------ 2. le cube et les 6 mouvements */
  function initCube() {
    var host = $("#cube"); if (!host) return;
    var W = 420, H = 300, S = 46, O = [210, 165];
    // projection isométrique : x vers le bas à gauche, y vers la droite, z vers le haut (comme les figures du cours)
    function proj(p) { return [O[0] + S * 0.866 * (p[1] - p[0]), O[1] + S * (0.5 * (p[0] + p[1]) - p[2])]; }
    var bx = 0.9, by = 1.25, bz = 0.55; // demi-dimensions du bloc
    var V0 = [];
    [-1, 1].forEach(function (i) { [-1, 1].forEach(function (j) { [-1, 1].forEach(function (k) { V0.push([i * bx, j * by, k * bz]); }); }); });
    var FACES = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]];
    function rot(p, ax, a) {
      var c = Math.cos(a), s = Math.sin(a), x = p[0], y = p[1], z = p[2];
      if (ax === 0) return [x, y * c - z * s, y * s + z * c];
      if (ax === 1) return [x * c + z * s, y, -x * s + z * c];
      return [x * c - y * s, x * s + y * c, z];
    }
    function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
    function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("class", "cube-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Un bloc dans le repère x, y, z ; les boutons le font bouger selon chacun des six mouvements");
    host.appendChild(svg);
    var axes = "<defs>" + [["x", "#C0392B"], ["y", "#1B7A43"], ["z", "#1F5FA8"], ["m", "#E06A00"]].map(function (c) {
      return '<marker id="cx-' + c[0] + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="' + c[1] + '"/></marker>';
    }).join("") + "</defs>";
    var ends = { x: [3.1, 0, 0], y: [0, 3.2, 0], z: [0, 0, 2.9] };
    var gAx = '<g class="cube-axes">';
    Object.keys(ends).forEach(function (k) {
      var a = proj([0, 0, 0]), b = proj(ends[k]);
      gAx += '<line class="ax-' + k + '" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" marker-end="url(#cx-' + k + ')"/>' +
        '<text class="ax-' + k + '" x="' + (b[0] + (k === "x" ? -14 : 6)).toFixed(1) + '" y="' + (b[1] + (k === "z" ? -4 : 14)).toFixed(1) + '">' + k + "</text>";
    });
    gAx += "</g>";
    svg.innerHTML = axes + '<g class="cube-ghost"></g>' + gAx + '<g class="cube-body"></g><g class="cube-arrow"></g>';
    var gBody = $(".cube-body", svg), gGhost = $(".cube-ghost", svg), gArrow = $(".cube-arrow", svg);
    var COL = ["#B8C7D6", "#8FA6BD", "#B8C7D6", "#C9D6E3", "#5E7690", "#F2B705"]; // -x +x -y +y -z +z ; dessus jaune pour suivre les rotations
    function draw(tr) {
      var P3 = V0.map(function (p) {
        var q = p;
        if (tr.r != null) q = rot(q, tr.r, tr.a);
        return [q[0] + (tr.t === 0 ? tr.d : 0), q[1] + (tr.t === 1 ? tr.d : 0), q[2] + (tr.t === 2 ? tr.d : 0)];
      });
      var polys = [];
      FACES.forEach(function (f, i) {
        var n = cross(sub(P3[f[1]], P3[f[0]]), sub(P3[f[3]], P3[f[0]]));
        // le centre de la face donne le sens extérieur
        var c = [0, 1, 2].map(function (k) { return (P3[f[0]][k] + P3[f[2]][k]) / 2; });
        var cc = [0, 1, 2].map(function (k) { return P3.reduce(function (s, p) { return s + p[k]; }, 0) / 8; });
        var out = sub(c, cc); if (n[0] * out[0] + n[1] * out[1] + n[2] * out[2] < 0) n = [-n[0], -n[1], -n[2]];
        if (n[0] + n[1] + n[2] <= 0) return; // face cachée
        var pts = f.map(function (v) { var p = proj(P3[v]); return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
        polys.push('<polygon points="' + pts + '" fill="' + COL[i] + '"/>');
      });
      gBody.innerHTML = polys.join("");
    }
    // silhouette fixe de la position de départ
    (function () {
      var hull = [];
      FACES.forEach(function (f) {
        hull.push('<polygon points="' + f.map(function (v) { var p = proj(V0[v]); return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '"/>');
      });
      gGhost.innerHTML = hull.join("");
    })();
    draw({});
    var TXT = {
      Tx: "Tx : translation (glissement) le long de l'axe x.", Ty: "Ty : translation le long de l'axe y.",
      Tz: "Tz : translation le long de l'axe z (monter, descendre).", Rx: "Rx : rotation autour de l'axe x.",
      Ry: "Ry : rotation autour de l'axe y.", Rz: "Rz : rotation autour de l'axe z (comme une toupie)."
    };
    function arrow(m) {
      var k = "xyz".indexOf(m[1]), out = "";
      if (m[0] === "T") {
        var e = [0, 0, 0], s = [0, 0, 0]; e[k] = 2.6; s[k] = 1.4;
        var a = proj(s), b = proj(e);
        out = '<line class="mv" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" marker-end="url(#cx-m)" marker-start="url(#cx-m)"/>';
      } else {
        var pts = [];
        for (var t = -0.2; t <= 4.9; t += 0.25) {
          var p = [0, 0, 0], u = (k + 1) % 3, v = (k + 2) % 3;
          p[k] = (k === 2 ? 2.2 : 2.4); p[u] = 0.45 * Math.cos(t); p[v] = 0.45 * Math.sin(t);
          var q = proj(p); pts.push(q[0].toFixed(1) + "," + q[1].toFixed(1));
        }
        out = '<polyline class="mv" points="' + pts.join(" ") + '" marker-end="url(#cx-m)"/>';
      }
      gArrow.innerHTML = out;
    }
    var raf = null;
    function play(m) {
      if (raf) cancelAnimationFrame(raf);
      $$(".cube-btns button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-m") === m ? "true" : "false"); });
      $("#cube-txt").textContent = TXT[m];
      arrow(m);
      var k = "xyz".indexOf(m[1]), t0 = null, DUR = REDUCE ? 1 : 2600;
      function step(ts) {
        if (t0 == null) t0 = ts;
        var u = Math.min(1, (ts - t0) / DUR), w = Math.sin(u * Math.PI * 2);
        if (m[0] === "T") draw({ t: k, d: 1.1 * w }); else draw({ r: k, a: 0.9 * w });
        if (u < 1) raf = requestAnimationFrame(step); else { draw({}); raf = null; }
      }
      raf = requestAnimationFrame(step);
    }
    $$(".cube-btns button").forEach(function (b) { b.addEventListener("click", function () { play(b.getAttribute("data-m")); }); });
  }

  /* ------------------------------------------------------------------ 3. liaisons élémentaires */
  function initVolumes() {
    $$(".ve-cell[data-l]").forEach(function (c) {
      c.addEventListener("click", function () {
        $$(".ve-cell").forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
        var l = BY[c.getAttribute("data-l")];
        $("#ve-out").innerHTML = '<p class="ve-k">' + c.getAttribute("data-c") + "</p><h3>" + l.nom + " <span class=\"ddl-pill\">" + ddl(l) + " ddl</span></h3><p>" +
          l.contact + "</p>" + mobTable(l.mob) + '<p><button type="button" class="btn ghost" data-go="' + l.id + '">Voir la liaison ' + l.nom.toLowerCase() + " en détail ↓</button></p>";
      });
    });
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-go]");
      if (!b) return;
      select(b.getAttribute("data-go"));
      $("#c-liaisons").scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" });
    });
  }

  /* ------------------------------------------------------------------ 4. explorateur des 11 liaisons */
  var cur = { id: "pivot", k: 0, guess: false };
  function renderList() {
    $("#lx-list").innerHTML = LIAISONS.map(function (l) {
      return '<button type="button" role="tab" data-id="' + l.id + '" aria-selected="false"><span class="lx-ddl">' + ddl(l) + "</span>" + l.nom + "</button>";
    }).join("");
    $$("#lx-list button").forEach(function (b) { b.addEventListener("click", function () { select(b.getAttribute("data-id")); }); });
  }
  function select(id) {
    if (BY[id] !== BY[cur.id]) cur.k = 0;
    cur.id = id; cur.guess = false;
    $$("#lx-list button").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-id") === id ? "true" : "false"); });
    renderCard();
  }
  function renderCard() {
    var l = BY[cur.id], mob = permute(l.mob, cur.k), n = ddl(l);
    var axSel = l.main == null ? "" :
      '<div class="lx-axes" role="group" aria-label="Orientation de la liaison"><span>' + (l.kind === "normale" ? "Normale au plan :" : l.kind === "doigt" ? "Rotation bloquée :" : "Axe de la liaison :") + "</span>" +
      AX.map(function (a, i) { var k = (i - l.main + 3) % 3; return '<button type="button" data-k="' + k + '" aria-pressed="' + (k === cur.k) + '">' + a + "</button>"; }).join("") + "</div>";
    var views = SCHEMAS[l.id].map(function (v, i) {
      return '<figure class="lx-view"><div class="lx-svg" data-v="' + i + '">' + v.svg + "</div><figcaption>" + v.cap + "</figcaption></figure>";
    }).join("");
    $("#lx-card").innerHTML =
      '<header class="lx-head"><div><h3>' + l.nom + (l.alias ? ' <small>' + l.alias + "</small>" : "") + '</h3><p class="lx-full">' + fullName(l, cur.k) + "</p></div>" +
      '<div class="lx-big" aria-label="' + n + ' degrés de liberté"><b>' + n + "</b><span>ddl</span></div></header>" +
      '<p class="lx-desc">' + l.desc + "</p>" + axSel +
      '<div class="lx-mob">' + mobTable(mob, { guess: cur.guess, combine: l.combine && !cur.guess }) +
      '<div class="lx-mob-btns">' + (cur.guess
        ? '<button type="button" class="btn" id="lx-check">Vérifier</button> <button type="button" class="btn ghost" id="lx-noguess">Afficher la réponse</button><p class="lx-fb" aria-live="polite"></p>'
        : '<button type="button" class="btn ghost" id="lx-guess">Je teste mes connaissances : je remplis le tableau</button>' +
          '<p class="small">Translations : <b>' + nT(l) + "</b> · rotations : <b>" + nR(l) + "</b>" + (l.combine ? " (liées)" : "") + "</p>") + "</div></div>" +
      '<div class="lx-grid"><div class="lx-schemas"><h4>Représentations planes <button type="button" class="btn ghost lx-play" aria-pressed="false">▶ Animer la pièce 2</button></h4>' +
      '<div class="lx-views">' + views + "</div>" +
      '<h4>Représentation en perspective</h4><img class="lx-persp" src="' + IMG["persp-" + l.id] + '" alt="Schéma en perspective de la liaison ' + l.nom.toLowerCase() + '"></div>' +
      '<div class="lx-ex"><h4>Exemple</h4><img src="' + IMG["ex-" + l.id] + '" alt="Exemple en 3D de la liaison ' + l.nom.toLowerCase() + ' : pièce 1 en bleu, pièce 2 en rouge">' +
      (l.main != null && cur.k !== 0 ? '<p class="small">L\'image montre la liaison dans sa position d\'origine (' + fullName(l, 0).replace(l.nom + " ", "") + ").</p>" : "") +
      '<p><strong>Contact :</strong> ' + l.contact + "</p><p><strong>Dans la vie courante :</strong> " + l.vie + "</p></div></div>";
    $$(".lx-axes button").forEach(function (b) { b.addEventListener("click", function () { cur.k = +b.getAttribute("data-k"); cur.guess = false; renderCard(); }); });
    var play = $(".lx-play");
    play.addEventListener("click", function () {
      var on = play.getAttribute("aria-pressed") !== "true";
      play.setAttribute("aria-pressed", on ? "true" : "false");
      play.textContent = on ? "■ Arrêter" : "▶ Animer la pièce 2";
      $$(".lx-views svg").forEach(function (s) { animate(s, on); });
    });
    if (cur.guess) {
      $$(".mob-g").forEach(function (b) {
        b.addEventListener("click", function () {
          var v = b.getAttribute("data-v") === "1" ? "0" : "1";
          b.setAttribute("data-v", v); b.textContent = v; b.setAttribute("aria-label", MVT[+b.getAttribute("data-i")] + " : " + v);
          b.parentNode.className = "";
        });
      });
      $("#lx-check").addEventListener("click", function () {
        var ok = 0;
        $$(".mob-g").forEach(function (b) {
          var good = +b.getAttribute("data-v") === mob[+b.getAttribute("data-i")];
          b.parentNode.className = good ? "g-ok" : "g-ko"; if (good) ok++;
        });
        $(".lx-fb").className = "lx-fb " + (ok === 6 ? "ok" : "ko");
        $(".lx-fb").textContent = ok === 6 ? "✔ Bravo, tableau juste : " + n + " degré" + (n > 1 ? "s" : "") + " de liberté." + (l.combine ? " (Tx et Rx sont liées : 1 seul ddl.)" : "")
          : "✘ " + ok + " case" + (ok > 1 ? "s" : "") + " juste" + (ok > 1 ? "s" : "") + " sur 6. Les cases en rouge sont à revoir.";
      });
      $("#lx-noguess").addEventListener("click", function () { cur.guess = false; renderCard(); });
    } else {
      $("#lx-guess").addEventListener("click", function () { cur.guess = true; renderCard(); });
    }
  }

  /* ------------------------------------------------------------------ 5. tableau récapitulatif */
  function renderRecap() {
    $("#recap-body").innerHTML = LIAISONS.map(function (l) {
      return '<tr data-ddl="' + ddl(l) + '"><th scope="row">' + l.nom + '</th><td class="rc-n">' + ddl(l) + "</td><td>" + (l.combine ? "1" : nT(l)) + "</td><td>" + (l.combine ? "1" : nR(l)) + "</td>" +
        '<td class="rc-sch"><div>' + SCHEMAS[l.id].map(function (v) { return v.svg; }).join("") + "</div></td>" +
        '<td class="rc-img"><img src="' + IMG["ex-" + l.id] + '" alt=""></td>' +
        '<td class="no-print"><button type="button" class="btn ghost" data-go="' + l.id + '">Explorer</button></td></tr>';
    }).join("");
    $$(".rc-filter button").forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-f");
        $$(".rc-filter button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        $$("#recap-body tr").forEach(function (tr) { tr.hidden = f !== "all" && tr.getAttribute("data-ddl") !== f; });
      });
    });
  }

  /* ------------------------------------------------------------------ 6. jeu « Quelle liaison ? » */
  function initJeu() {
    var N = 10, st;
    function newGame() {
      var order = [], pool = [];
      while (order.length < N) {
        if (!pool.length) pool = shuffle(LIAISONS.map(function (l) { return l.id; }));
        var id = pool.pop(), type = order.length % 2 ? "schema" : "table";
        if (type === "table" && id === "helicoidale") type = "schema"; // tableau identique au pivot glissant
        order.push({ id: id, type: type, k: Math.floor(Math.random() * 3), v: Math.floor(Math.random() * SCHEMAS[id].length) });
      }
      st = { i: 0, ok: 0, order: order };
      $("#jeu-end").hidden = true; $("#jeu-play").hidden = false;
      round();
    }
    function round() {
      var r = st.order[st.i], l = BY[r.id];
      $("#jeu-prog").style.width = (st.i / N * 100) + "%";
      $("#jeu-num").textContent = "Manche " + (st.i + 1) + " / " + N + " · score " + st.ok;
      $("#jeu-q").innerHTML = r.type === "table"
        ? "<p>Voici le tableau des mobilités entre deux pièces. <strong>Quelle est la liaison ?</strong></p>" + mobTable(permute(l.mob, l.main == null ? 0 : r.k))
        : "<p>Voici une représentation plane normalisée. <strong>Quelle est la liaison ?</strong></p>" + '<div class="jeu-sch">' + SCHEMAS[r.id][r.v].svg + "</div>";
      var others = shuffle(LIAISONS.filter(function (x) {
        return x.id !== r.id && !(r.type === "table" && x.id === "helicoidale" && r.id === "pivot-glissant");
      })).slice(0, 3);
      var opts = shuffle(others.concat([l]));
      $("#jeu-opts").innerHTML = opts.map(function (o) { return '<button type="button" class="btn ghost" data-id="' + o.id + '">' + o.nom + "</button>"; }).join("");
      $("#jeu-fb").textContent = ""; $("#jeu-fb").className = "jeu-fb"; $("#jeu-next").hidden = true;
      $$("#jeu-opts button").forEach(function (b) {
        b.addEventListener("click", function () {
          var good = b.getAttribute("data-id") === r.id;
          if (good) st.ok++;
          $$("#jeu-opts button").forEach(function (x) {
            x.disabled = true;
            if (x.getAttribute("data-id") === r.id) x.classList.add("good"); else if (x === b) x.classList.add("bad");
          });
          $("#jeu-fb").className = "jeu-fb " + (good ? "ok" : "ko");
          var nom = r.type === "table" ? fullName(l, l.main == null ? 0 : r.k) : l.nom;
          $("#jeu-fb").textContent = (good ? "✔ Exact : " : "✘ Non : c'est la liaison ") + nom.charAt(0).toLowerCase() + nom.slice(1) + " (" + ddl(l) + " ddl).";
          $("#jeu-num").textContent = "Manche " + (st.i + 1) + " / " + N + " · score " + st.ok;
          $("#jeu-next").hidden = false; $("#jeu-next").focus();
        });
      });
    }
    $("#jeu-next").addEventListener("click", function () {
      st.i++;
      if (st.i < N) return round();
      $("#jeu-prog").style.width = "100%";
      $("#jeu-play").hidden = true; $("#jeu-end").hidden = false;
      var stars = st.ok === N ? 3 : st.ok >= 8 ? 2 : st.ok >= 5 ? 1 : 0;
      $("#jeu-score").textContent = st.ok + " / " + N;
      $("#jeu-stars").textContent = "★★★".slice(0, stars) + "☆☆☆".slice(0, 3 - stars);
      $("#jeu-msg").textContent = st.ok === N ? "Parfait ! Tu reconnais toutes les liaisons." : st.ok >= 8 ? "Très bien, encore un petit effort !" :
        st.ok >= 5 ? "C'est un bon début : revois le tableau récapitulatif et rejoue." : "Reprends l'explorateur des liaisons, puis rejoue.";
    });
    $("#jeu-again").addEventListener("click", newGame);
    newGame();
  }

  /* ------------------------------------------------------------------ 7. quiz noté (même moteur que les cours de RDM) */
  function initQuiz() {
    var qs = $$(".quiz-q");
    function score() {
      var n = qs.filter(function (f) { return f.classList.contains("is-ok"); }).length;
      var done = qs.filter(function (f) { return f.classList.contains("done"); }).length;
      var st = n === qs.length ? 3 : n >= qs.length - 2 ? 2 : n >= 3 ? 1 : 0;
      $("#qz-score").textContent = n + " / " + qs.length;
      $("#qz-stars").textContent = done === qs.length ? "★★★".slice(0, st) + "☆☆☆".slice(0, 3 - st) : "";
    }
    qs.forEach(function (fs) {
      fs.addEventListener("change", function (e) {
        if (fs.classList.contains("done")) return;
        var ok = e.target.value === fs.getAttribute("data-ok");
        fs.classList.add("done", ok ? "is-ok" : "is-ko");
        $(".quiz-fb", fs).textContent = ok ? "✔ Bonne réponse !" : "✘ Pas tout à fait.";
        $(".quiz-why", fs).hidden = false;
        $$("input", fs).forEach(function (i) { i.disabled = true; if (i.value === fs.getAttribute("data-ok")) i.parentNode.classList.add("good"); });
        score();
      });
    });
    $("#qz-reset").addEventListener("click", function () {
      qs.forEach(function (fs) {
        fs.classList.remove("done", "is-ok", "is-ko");
        $(".quiz-fb", fs).textContent = ""; $(".quiz-why", fs).hidden = true;
        $$("input", fs).forEach(function (i) { i.disabled = false; i.checked = false; i.parentNode.classList.remove("good"); });
      });
      score();
    });
    score();
  }

  /* ------------------------------------------------------------------ 1. définition : contact animé */
  function initDef() {
    var b = $("#def-play"); if (!b) return;
    b.addEventListener("click", function () {
      var s = $("#def-svg"), on = !s.classList.contains("on");
      s.classList.toggle("on", on);
      b.textContent = on ? "■ Arrêter" : "▶ Faire tourner la pièce 2";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initDef(); initCube(); initVolumes(); renderList(); select("pivot"); renderRecap(); initJeu(); initQuiz();
    $("#cours-print").addEventListener("click", function () { window.print(); });
  });
  window.__LIAISONS__ = { LIAISONS: LIAISONS, ddl: ddl, permute: permute, fullName: fullName, select: select };
})();
