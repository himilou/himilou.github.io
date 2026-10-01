(async function () {
   const root = document.getElementById("site-root");

   async function fetchMarkup(path) {
      const response = await fetch(path);
      if (!response.ok) {
         throw new Error(`Could not load ${path}: ${response.status}`);
      }
      return response.text();
   }

   function loadScript(path) {
      return new Promise((resolve, reject) => {
         const script = document.createElement("script");
         script.src = path;
         script.onload = resolve;
         script.onerror = () => reject(new Error(`Could not load ${path}`));
         document.body.append(script);
      });
   }

   try {
      const [masterMarkup, pageMarkup] = await Promise.all([
         fetchMarkup("master.html"),
         fetchMarkup(document.body.dataset.page)
      ]);
      const master = document.createElement("template");
      const page = document.createElement("template");
      master.innerHTML = masterMarkup;
      page.innerHTML = pageMarkup;

      const header = master.content.querySelector("[data-site-header]");
      const headerContent = page.content.querySelector("[data-site-header-content]");
      const headerClass = document.body.dataset.headerClass;
      if (headerClass) {
         header.classList.add(...headerClass.split(/\s+/));
      }
      if (headerContent) {
         master.content.querySelector("[data-site-header-content]").replaceChildren(...headerContent.childNodes);
         headerContent.remove();
      }
      master.content.querySelector("#page-content").replaceChildren(...page.content.childNodes);
      root.replaceChildren(...master.content.childNodes);

      for (const script of [
         "js/jquery.min.js",
         "js/jquery-3.0.0.min.js",
         "js/popper.min.js",
         "js/bootstrap.bundle.min.js",
         "js/plugin.js",
         "js/jquery.mCustomScrollbar.concat.min.js",
         "js/custom.js"
      ]) {
         await loadScript(script);
      }

      const carousel = window.jQuery && window.jQuery("#myCarousel");
      if (carousel && carousel.length && typeof carousel.carousel === "function") {
         carousel.carousel({ interval: false });
         let touchStartY;
         carousel.on("touchstart", function (event) {
            touchStartY = event.originalEvent.touches[0].pageY;
         });
         carousel.on("touchend", function (event) {
            const touchEndY = event.originalEvent.changedTouches[0].pageY;
            if (Math.floor(touchStartY - touchEndY) > 1) {
               carousel.carousel("next");
            } else if (Math.floor(touchStartY - touchEndY) < -1) {
               carousel.carousel("prev");
            }
         });
      }
   } catch (error) {
      console.error(error);
      if (root) {
         root.textContent = "This page could not be loaded. Please try again from the website.";
      }
   }
})();