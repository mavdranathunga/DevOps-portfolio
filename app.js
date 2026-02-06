(() => {
  const root = document.documentElement;
  const themeBtn = document.getElementById("themeBtn");
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const toastEl = document.getElementById("toast");

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Theme (persist)
  const THEME_KEY = "portfolioTheme";
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light") root.setAttribute("data-theme", "light");

  const setThemeIcon = () => {
    const isLight = root.getAttribute("data-theme") === "light";
    themeBtn.querySelector(".icon").textContent = isLight ? "☀" : "☾";
  };
  setThemeIcon();

  themeBtn?.addEventListener("click", () => {
    const isLight = root.getAttribute("data-theme") === "light";
    if (isLight) {
      root.removeAttribute("data-theme");
      localStorage.setItem(THEME_KEY, "dark");
    } else {
      root.setAttribute("data-theme", "light");
      localStorage.setItem(THEME_KEY, "light");
    }
    setThemeIcon();
    toast(isLight ? "Dark theme enabled" : "Light theme enabled");
  });

  // Mobile menu toggle
  menuBtn?.addEventListener("click", () => {
    const open = mobileMenu.getAttribute("aria-hidden") === "false";
    mobileMenu.setAttribute("aria-hidden", open ? "true" : "false");
    mobileMenu.style.display = open ? "none" : "block";
  });

  // Close mobile menu on click
  mobileMenu?.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    mobileMenu.setAttribute("aria-hidden", "true");
    mobileMenu.style.display = "none";
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", id);
    });
  });

  // Project filtering
  const filters = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll(".card");

  filters.forEach(btn => {
    btn.addEventListener("click", () => {
      filters.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const f = btn.dataset.filter;
      cards.forEach(card => {
        const tags = (card.dataset.tags || "").split(",").map(t => t.trim());
        const show = f === "all" ? true : tags.includes(f);
        card.style.display = show ? "flex" : "none";
      });

      toast(f === "all" ? "Showing all projects" : `Filter: ${f.toUpperCase()}`);
    });
  });

  // Copy email
  const copyEmailBtn = document.getElementById("copyEmail");
  const emailBtn = document.getElementById("emailBtn");

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    }
  }

  async function handleCopy(btn) {
    const email = btn?.dataset?.email;
    if (!email) return;
    const ok = await copyText(email);
    toast(ok ? "Email copied" : "Copy failed");
  }

  copyEmailBtn?.addEventListener("click", () => handleCopy(copyEmailBtn));
  emailBtn?.addEventListener("click", () => handleCopy(emailBtn));

  // Contact form (demo)
  const form = document.getElementById("contactForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || !email || !message) return toast("Please fill all required fields (*)");
    if (!emailOk) return toast("Please enter a valid email");

    form.reset();
    toast("Message queued (demo) — add a backend to send it.");
  });

  // Toast
  let t;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(t);
    t = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  const frame = document.querySelector(".hero__right .frame");
  if (!frame) return;

  const img = frame.querySelector(".frame__img");
  let raf = null;

  function onMove(e){
    const r = frame.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    const px = x / r.width;
    const py = y / r.height;

    const rotY = (px - 0.5) * 10;  // left/right
    const rotX = -(py - 0.5) * 10; // up/down

    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      frame.classList.add("is-tilting");
      frame.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
      if (img){
        img.style.setProperty("--mx", `${px * 100}%`);
        img.style.setProperty("--my", `${py * 100}%`);
      }
    });
  }

  function reset(){
    frame.classList.remove("is-tilting");
    frame.style.transform = "";
  }

  // Only enable on fine pointers (desktop mouse)
  const finePointer = matchMedia("(pointer:fine)").matches;
  if (!finePointer) return;

  frame.addEventListener("mousemove", onMove);
  frame.addEventListener("mouseleave", reset);

  if (!frame || !img) return;

  // Desktop only (don’t run on touch)
  if (!matchMedia("(pointer:fine)").matches) return;

  function onMove(e){
    const r = frame.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    const px = Math.max(0, Math.min(1, x / r.width));
    const py = Math.max(0, Math.min(1, y / r.height));

    const rotY = (px - 0.5) * 10;
    const rotX = -(py - 0.5) * 10;

    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      frame.classList.add("is-tilting");
      frame.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
      img.style.setProperty("--mx", `${px * 100}%`);
      img.style.setProperty("--my", `${py * 100}%`);
    });
  }

  function reset(){
    frame.classList.remove("is-tilting");
    frame.style.transform = "";
  }

  frame.addEventListener("mousemove", onMove);
  frame.addEventListener("mouseleave", reset);

  if (!matchMedia("(pointer:fine)").matches) return;

  const cursor = document.getElementById("termCursor");
  const ring = document.getElementById("termRing");
  if (!cursor || !ring) return;

  document.body.classList.add("terminal-cursor");

  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let rx = x, ry = y;

  window.addEventListener("mousemove", (e) => {
    x = e.clientX;
    y = e.clientY;
    cursor.style.left = x + "px";
    cursor.style.top = y + "px";
  });

  // Smooth trailing ring
  function animate(){
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(animate);
  }
  animate();

  // On mousedown: “press”
  window.addEventListener("mousedown", () => {
    ring.style.transform = "translate(-50%,-50%) scale(0.85)";
  });
  window.addEventListener("mouseup", () => {
    ring.style.transform = "translate(-50%,-50%) scale(1)";
  });  


function blocked() {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = "Content protected";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1200);
}

document.addEventListener("copy", blocked);
document.addEventListener("contextmenu", blocked);


  // Disable right-click
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// Disable copy, cut, paste
["copy", "cut", "paste"].forEach(evt => {
  document.addEventListener(evt, (e) => {
    e.preventDefault();
  });
});

// Disable keyboard copy shortcuts
document.addEventListener("keydown", (e) => {
  if (
    (e.ctrlKey || e.metaKey) &&
    ["c", "x", "a", "s", "u"].includes(e.key.toLowerCase())
  ) {
    e.preventDefault();
  }
});

// Disable drag
document.addEventListener("dragstart", (e) => {
  e.preventDefault();
});

})();
