/* Small, dependency-free helpers for the home page. */
(function () {
  "use strict";

  /* ---- Hero carousel ---------------------------------------------------- */
  var carousel = document.querySelector(".carousel");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".slide"));
    var controls = carousel.querySelector(".carousel-controls");
    var dotsBox = carousel.querySelector(".dots");
    var liveRegion = carousel.querySelector(".slides");
    var pauseBtn = carousel.querySelector(".carousel-pause");
    var INTERVAL = 5000; // same as the original site
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var current = 0;
    var timer = null;
    var userPaused = reduceMotion; // never auto-advance if motion is reduced
    var hovering = false;
    var dots = [];

    slides.forEach(function (slide, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot";
      var name = slide.querySelector(".slide-title, .hero-title").textContent.trim();
      dot.setAttribute("aria-label", "Show slide " + (i + 1) + " of " + slides.length + ": " + name);
      dot.addEventListener("click", function () { show(i); });
      dotsBox.appendChild(dot);
      dots.push(dot);
    });
    controls.hidden = false;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) { slide.classList.toggle("is-active", i === current); });
      dots.forEach(function (dot, i) {
        if (i === current) { dot.setAttribute("aria-current", "true"); }
        else { dot.removeAttribute("aria-current"); }
      });
    }

    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      stop();
      if (!userPaused && !hovering) {
        timer = setInterval(function () { show(current + 1); }, INTERVAL);
      }
      liveRegion.setAttribute("aria-live", timer ? "off" : "polite");
    }

    pauseBtn.addEventListener("click", function () {
      userPaused = !userPaused;
      pauseBtn.textContent = userPaused ? "Play" : "Pause";
      pauseBtn.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
      start();
    });

    // pause while the pointer is over it or focus is inside it
    carousel.addEventListener("mouseenter", function () { hovering = true; start(); });
    carousel.addEventListener("mouseleave", function () { hovering = false; start(); });
    carousel.addEventListener("focusin", function () { hovering = true; start(); });
    carousel.addEventListener("focusout", function () { hovering = false; start(); });

    // swipe left or right on touch screens
    var startX = null, startY = null;
    carousel.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    }, { passive: true });
    carousel.addEventListener("touchend", function (e) {
      if (startX === null) { return; }
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      startX = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { show(current + (dx < 0 ? 1 : -1)); start(); }
    }, { passive: true });

    if (userPaused) { pauseBtn.textContent = "Play"; pauseBtn.setAttribute("aria-label", "Play slideshow"); }
    show(0);
    start();
  }

  /* ---- Service tiles: touch screens have no hover, so a tap turns one blue */
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".tile"));
  function clearTiles() { tiles.forEach(function (t) { t.classList.remove("is-on"); }); }

  tiles.forEach(function (tile) {
    tile.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") { return; } // mouse users get :hover
      clearTiles();
      tile.classList.add("is-on");
    });
  });
  document.addEventListener("pointerdown", function (e) {
    if (!e.target.closest(".tile")) { clearTiles(); }
  });
  window.addEventListener("pageshow", clearTiles); // back button after tapping a link
})();
