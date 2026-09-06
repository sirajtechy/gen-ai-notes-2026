/* GenAI Engineering Notes — theme toggle, reading progress, Mermaid diagrams */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORE_KEY = "genai-notes-theme";

  /* ---------- theme ---------- */
  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set === "light" || set === "dark") return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORE_KEY, theme);
    } catch (e) {}
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " theme");
    renderMermaid(theme);
  }

  (function initTheme() {
    var saved = null;
    try {
      saved = localStorage.getItem(STORE_KEY);
    } catch (e) {}
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  })();

  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("#theme-toggle");
    if (!t) return;
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  });

  /* ---------- reading progress ---------- */
  var bar = document.getElementById("progress");
  if (bar) {
    var onScroll = function () {
      var h = document.body.scrollHeight - window.innerHeight;
      var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = pct.toFixed(2) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  /* ---------- wrap wide tables for horizontal scroll ---------- */
  document.querySelectorAll(".post-body > table").forEach(function (tbl) {
    var wrap = document.createElement("div");
    wrap.className = "table-scroll";
    tbl.parentNode.insertBefore(wrap, tbl);
    wrap.appendChild(tbl);
  });

  /* ---------- Mermaid ---------- */
  var mermaidBlocks = []; // { el, src }

  function collectMermaid() {
    // kramdown/GFM renders ```mermaid as <pre><code class="language-mermaid">
    document.querySelectorAll('pre > code.language-mermaid').forEach(function (code) {
      var pre = code.parentNode;
      var holder = document.createElement("div");
      holder.className = "mermaid-wrap";
      var dia = document.createElement("div");
      dia.className = "mermaid";
      var src = code.textContent;
      dia.textContent = src;
      holder.appendChild(dia);
      pre.parentNode.replaceChild(holder, pre);
      mermaidBlocks.push({ el: dia, src: src });
    });
    // also support raw <div class="mermaid"> authored directly
    document.querySelectorAll("div.mermaid").forEach(function (dia) {
      if (mermaidBlocks.some(function (b) { return b.el === dia; })) return;
      if (!dia.closest(".mermaid-wrap")) {
        var holder = document.createElement("div");
        holder.className = "mermaid-wrap";
        dia.parentNode.insertBefore(holder, dia);
        holder.appendChild(dia);
      }
      mermaidBlocks.push({ el: dia, src: dia.textContent });
    });
  }

  var mermaidReady = false;
  function renderMermaid(theme) {
    if (!window.mermaid || !mermaidBlocks.length) return;
    try {
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: theme === "dark" ? "dark" : "neutral",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        flowchart: { curve: "basis", htmlLabels: false, padding: 12 },
        themeVariables: { fontSize: "15px" },
      });
      mermaidBlocks.forEach(function (b, i) {
        b.el.removeAttribute("data-processed");
        b.el.innerHTML = "";
        b.el.textContent = b.src;
        b.el.id = "mmd-" + i;
      });
      window.mermaid.run({ nodes: mermaidBlocks.map(function (b) { return b.el; }) });
      mermaidReady = true;
    } catch (e) {
      /* leave source visible on failure */
      if (window.console) console.warn("mermaid render failed", e);
    }
  }

  function loadMermaid() {
    collectMermaid();
    if (!mermaidBlocks.length) return;
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js";
    s.onload = function () { renderMermaid(currentTheme()); };
    document.head.appendChild(s);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadMermaid);
  } else {
    loadMermaid();
  }
})();
