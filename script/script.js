const portfolioState = {
  dataPromise: null,
  lightboxImages: [],
  lightboxIndex: 0,
  heroTimer: null,
  scrollLockY: 0
};

document.addEventListener("DOMContentLoaded", async () => {
  initCopyright();
  initLightbox();
  initContactPopup();
  initImageProtection();
  await initHeaderInjection();

  try {
    const data = await loadPortfolioData();

    initSelectedWork(data);
    initFeaturedProjects(data);
    initServices(data);
    initProcess(data);
    initTestimonials(data);
    initAbout(data);
    initContactProjectTypes(data);
    initGalleryArchive(data);
    initHeroBackgroundCarousel(data);
  } catch (error) {
    console.error("Portfolio initialization error:", error);
  }
});

/* =========================================
   DATA
========================================= */
function loadPortfolioData() {
  if (!portfolioState.dataPromise) {
    portfolioState.dataPromise = fetch("data/data.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load data/data.json (${response.status})`);
        }
        return response.json();
      });
  }

  return portfolioState.dataPromise;
}

function buildGalleryImages(gallery) {
  if (!gallery?.src || !gallery?.count) return [];

  return Array.from(
    { length: gallery.count },
    (_, index) => `${gallery.src}/0-${index + 1}.jpg`
  );
}

function buildGeneralGalleryImages(data) {
  const order = data.generalGallery?.order || [];
  return order.flatMap((key) => buildGalleryImages(data.galleries?.[key]));
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/* =========================================
   HEADER
========================================= */
async function initHeaderInjection() {
  const headerMount = document.getElementById("header");
  if (!headerMount) return;

  try {
    const response = await fetch("data/header.html");
    if (!response.ok) throw new Error(`Header request failed (${response.status})`);

    headerMount.innerHTML = await response.text();

    const header = document.getElementById("container_top");
    const menuButton = document.getElementById("btnHamburguesa");
    const mobileNav = document.getElementById("navbarMenu");

    if (!header || !menuButton || !mobileNav) return;

    const closeMenu = () => {
      mobileNav.classList.remove("is-open");
      mobileNav.setAttribute("aria-hidden", "true");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.querySelector("span").textContent = "Menu";
      document.body.classList.remove("menu-open");
    };

    const openMenu = () => {
      mobileNav.classList.add("is-open");
      mobileNav.setAttribute("aria-hidden", "false");
      menuButton.setAttribute("aria-expanded", "true");
      menuButton.querySelector("span").textContent = "Close";
      document.body.classList.add("menu-open");
    };

    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    mobileNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) closeMenu();
    });

    const updateHeaderState = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    window.addEventListener("scroll", updateHeaderState, { passive: true });
    updateHeaderState();
  } catch (error) {
    console.error("Header load error:", error);
  }
}

/* =========================================
   SELECTED WORK
========================================= */
function initSelectedWork(data) {
  const grid = document.getElementById("selectedWorkGrid");
  if (!grid) return;

  const items = data.site?.selectedWork || [];
  grid.innerHTML = "";

  items.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "selected-work-item";
    button.dataset.lightboxSrc = item.src;
    button.dataset.lightboxGroup = "selected-work";
    button.setAttribute("aria-label", `Open ${item.category || "selected work"} image`);

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt || "Selected photography work";
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;
    img.classList.add("protected-photo");

    const rights = createRightsMark();

    const label = document.createElement("span");
    label.className = "selected-work-label";
    label.textContent = item.category || "Selected Work";

    button.append(img,label);
    grid.appendChild(button);
  });
}

/* =========================================
   FEATURED PROJECTS
========================================= */
function initFeaturedProjects(data) {
  const container = document.getElementById("featuredProjects");
  if (!container) return;

  const projects = data.projects || [];
  container.innerHTML = "";

  projects.forEach((project, projectIndex) => {
    const row = document.createElement("article");
    row.className = "project-row";

    const media = document.createElement("div");
    media.className = "project-media";

    const heroButton = createLightboxButton({
      src: project.hero,
      alt: `${project.title} featured image`,
      group: `project-${project.id}`,
      className: "project-hero-button",
      imageClassName: "project-hero",
      eager: projectIndex === 0
    });

    media.appendChild(heroButton);

    const related = (project.images || []).filter((src) => src !== project.hero).slice(0, 2);
    if (related.length) {
      const relatedWrap = document.createElement("div");
      relatedWrap.className = "project-related";

      related.forEach((src, index) => {
        relatedWrap.appendChild(createLightboxButton({
          src,
          alt: `${project.title} related image ${index + 1}`,
          group: `project-${project.id}`,
          className: "project-thumb-button",
          eager: false
        }));
      });

      media.appendChild(relatedWrap);
    }

    const content = document.createElement("div");
    content.className = "project-content";
    content.innerHTML = `
      <p class="project-kicker">${escapeHTML(project.category || "Project")}</p>
      <h3>${escapeHTML(project.title || "Untitled Project")}</h3>
      <p class="project-objective">${escapeHTML(project.objective || "")}</p>
      <p class="project-description">${escapeHTML(project.description || "")}</p>
      <p class="project-meta"><strong>Best suited for:</strong> ${escapeHTML(project.use || "")}</p>
      <p class="project-meta"><strong>Visual approach:</strong> ${escapeHTML(project.technical || "")}</p>
      <a class="text-link project-link" href="${escapeAttribute(project.link || "gallery.html?service=photography")}">View project <span aria-hidden="true">→</span></a>
    `;

    row.append(media, content);
    container.appendChild(row);
  });
}

function createLightboxButton({ src, alt, group, className, imageClassName = "", eager = false }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.dataset.lightboxSrc = src;
  button.dataset.lightboxGroup = group;
  button.setAttribute("aria-label", `Open ${alt}`);

  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.loading = eager ? "eager" : "lazy";
  img.decoding = "async";
  img.draggable = false;
  img.classList.add("protected-photo");
  if (imageClassName) img.classList.add(imageClassName);

  button.append(img);
  return button;
}

/* =========================================
   SERVICES / PROCESS / TESTIMONIALS / ABOUT
========================================= */
function initServices(data) {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;

  grid.innerHTML = (data.services || []).map((service) => `
    <article class="service-item">
      <h3>${escapeHTML(service.title)}</h3>
      <p>${escapeHTML(service.description)}</p>
    </article>
  `).join("");
}

function initProcess(data) {
  const grid = document.getElementById("processGrid");
  if (!grid) return;

  grid.innerHTML = (data.process || []).map((step) => `
    <li class="process-item">
      <h3>${escapeHTML(step.title)}</h3>
      <p>${escapeHTML(step.description)}</p>
    </li>
  `).join("");
}

function initTestimonials(data) {
  const section = document.getElementById("client-experience");
  const grid = document.getElementById("testimonialsGrid");
  if (!section || !grid) return;

  const published = (data.testimonials || []).filter((testimonial) => testimonial.published === true);

  if (!published.length) {
    section.hidden = true;
    return;
  }

  grid.innerHTML = published.map((testimonial) => {
    const source = [testimonial.name, testimonial.company].filter(Boolean).join(" · ");
    return `
      <article class="testimonial">
        <blockquote>“${escapeHTML(testimonial.quote)}”</blockquote>
        ${source ? `<cite>${escapeHTML(source)}</cite>` : ""}
      </article>
    `;
  }).join("");

  section.hidden = false;
}

function initAbout(data) {
  const lead = document.getElementById("aboutLead");
  const body = document.getElementById("aboutBody");
  const highlights = document.getElementById("aboutHighlights");
  const about = data.about;

  if (!about) return;
  if (lead) lead.textContent = about.lead || "";
  if (body) body.textContent = about.body || "";

  if (highlights) {
    highlights.innerHTML = (about.highlights || [])
      .map((item) => `<div class="about-highlight">${escapeHTML(item)}</div>`)
      .join("");
  }
}

function initContactProjectTypes(data) {
  const select = document.getElementById("project_type");
  if (!select) return;

  (data.services || []).forEach((service) => {
    const option = document.createElement("option");
    option.value = service.title;
    option.textContent = service.title;
    select.appendChild(option);
  });

  const other = document.createElement("option");
  other.value = "Other / Not sure yet";
  other.textContent = "Other / Not sure yet";
  select.appendChild(other);
}

/* =========================================
   GALLERY ARCHIVE
========================================= */
function initGalleryArchive(data) {
  if (!document.body.classList.contains("page-gallery")) return;

  const mount = document.getElementById("gallery_grid");
  const nav = document.getElementById("galleryCategoryNav");
  const title = document.getElementById("gallery_title");
  const description = document.getElementById("gallery_desc");
  if (!mount || !nav) return;

  const params = new URLSearchParams(window.location.search);
  const requestedKey = (params.get("service") || "photography").toLowerCase();
  const serviceKey = data.galleries?.[requestedKey] ? requestedKey : "photography";
  const galleryData = data.galleries?.[serviceKey] || data.galleries?.photography;

  if (title) title.textContent = galleryData?.title || "Work Archive";
  if (description) description.textContent = galleryData?.description || "";

  renderArchiveNav(data, nav, serviceKey);
  mount.innerHTML = "";

  const keys = serviceKey === "photography"
    ? (data.generalGallery?.order || [])
    : [serviceKey];

  keys.forEach((key, groupIndex) => {
    const gallery = data.galleries?.[key];
    if (!gallery?.src || !gallery?.count) return;

    const group = document.createElement("section");
    group.className = "archive-group";

    const heading = document.createElement("div");
    heading.className = "archive-group-heading";
    heading.innerHTML = `
      <h2>${escapeHTML(gallery.title)}</h2>
      <p>${escapeHTML(gallery.description || "")}</p>
    `;

    const grid = document.createElement("div");
    grid.className = "gallery-grid";

    buildGalleryImages(gallery).forEach((src, imageIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-item";
      button.dataset.lightboxSrc = src;
      button.dataset.lightboxGroup = `archive-${key}`;
      button.setAttribute("aria-label", `Open ${gallery.title} image ${imageIndex + 1}`);

      const img = document.createElement("img");
      img.src = src;
      img.alt = `${gallery.title}, image ${imageIndex + 1}`;
      img.loading = groupIndex === 0 && imageIndex === 0 ? "eager" : "lazy";
      img.decoding = "async";
      img.draggable = false;
      img.classList.add("protected-photo");
      if (groupIndex === 0 && imageIndex === 0) img.fetchPriority = "high";

      button.append(img);
      grid.appendChild(button);
    });

    group.append(heading, grid);
    mount.appendChild(group);
  });
}

function renderArchiveNav(data, nav, activeKey) {
  const items = [
    ["photography", "All Work"],
    ...(data.generalGallery?.order || []).map((key) => [key, data.galleries?.[key]?.title || key])
  ];

  nav.innerHTML = items.map(([key, label]) => `
    <a class="${key === activeKey ? "is-active" : ""}" href="gallery.html?service=${encodeURIComponent(key)}">${escapeHTML(label)}</a>
  `).join("");
}

/* =========================================
   HERO CAROUSEL
========================================= */
async function initHeroBackgroundCarousel(data) {
  const container = document.getElementById("cont_background");
  if (!container || !document.body.classList.contains("page-home")) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const config = data.site?.heroCarousel || {};
  const targetCount = Math.max(1, Number(config.count) || 5);
  const selectionKey = config.selectionKey || "jlprezcHeroSelection";

  let selection = readSessionSelection(selectionKey, targetCount);

  if (!selection.length) {
    selection = await findLandscapeHeroSelection(data, targetCount, Number(config.candidateLimit) || 18);
    if (selection.length) {
      sessionStorage.setItem(selectionKey, JSON.stringify(selection));
    }
  }

  if (!selection.length) {
    const fallback = data.site?.hero?.fallbackImage;
    if (fallback) selection = [fallback];
  }

  if (!selection.length) return;

  const frameA = createHeroFrame(true);
  const frameB = createHeroFrame(false);
  container.prepend(frameA, frameB);

  frameA.addEventListener("load", () => frameA.classList.add("is-active"), { once: true });
  frameA.src = selection[0];
  if (frameA.complete && frameA.naturalWidth > 0) frameA.classList.add("is-active");

  if (reducedMotion || selection.length === 1) return;

  let currentIndex = 0;
  let activeFrame = frameA;
  let standbyFrame = frameB;

  const scheduleNext = () => {
    clearTimeout(portfolioState.heroTimer);
    portfolioState.heroTimer = window.setTimeout(async () => {
      const nextIndex = (currentIndex + 1) % selection.length;
      const nextSrc = selection[nextIndex];

      const ready = await loadIntoFrame(standbyFrame, nextSrc);
      if (!ready) {
        currentIndex = nextIndex;
        scheduleNext();
        return;
      }

      standbyFrame.classList.add("is-active");
      activeFrame.classList.remove("is-active");

      const oldActive = activeFrame;
      activeFrame = standbyFrame;
      standbyFrame = oldActive;
      currentIndex = nextIndex;

      scheduleNext();
    }, 5200);
  };

  scheduleNext();
}

function createHeroFrame(isPrimary) {
  const img = document.createElement("img");
  img.className = "hero-carousel-image protected-photo";
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  img.decoding = "async";
  img.draggable = false;
  img.loading = isPrimary ? "eager" : "lazy";
  if (isPrimary) img.fetchPriority = "high";
  return img;
}

function loadIntoFrame(frame, src) {
  return new Promise((resolve) => {
    const onLoad = () => {
      cleanup();
      resolve(true);
    };
    const onError = () => {
      cleanup();
      resolve(false);
    };
    const cleanup = () => {
      frame.removeEventListener("load", onLoad);
      frame.removeEventListener("error", onError);
    };

    frame.addEventListener("load", onLoad, { once: true });
    frame.addEventListener("error", onError, { once: true });
    frame.src = src;
  });
}

function readSessionSelection(key, count) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, count) : [];
  } catch {
    return [];
  }
}

async function findLandscapeHeroSelection(data, count, candidateLimit) {
  const candidates = shuffleArray([...buildGeneralGalleryImages(data)]);
  const selected = [];
  const maxCandidates = Math.min(candidates.length, Math.max(count, candidateLimit));

  for (let index = 0; index < maxCandidates && selected.length < count; index++) {
    const src = candidates[index];
    const isLandscape = await imageIsLandscape(src);
    if (isLandscape && !selected.includes(src)) selected.push(src);
  }

  return selected;
}

function imageIsLandscape(src) {
  const cacheKey = "jlprezcImageOrientationV1";
  let cache = {};

  try {
    cache = JSON.parse(localStorage.getItem(cacheKey) || "{}");
  } catch {
    cache = {};
  }

  if (cache[src]) {
    return Promise.resolve(cache[src] === "landscape");
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";

    img.onload = () => {
      const orientation = img.naturalWidth > img.naturalHeight ? "landscape" : "other";
      cache[src] = orientation;
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cache));
      } catch {
        // Orientation caching is an optimization only.
      }
      resolve(orientation === "landscape");
    };

    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/* =========================================
   LIGHTBOX
========================================= */
function initLightbox() {
  const overlay = document.getElementById("popupOverlay");
  const image = document.getElementById("popupImage");
  const prev = document.getElementById("prevBtn");
  const next = document.getElementById("nextBtn");
  const close = document.getElementById("closeLightbox");

  if (!overlay || !image || !prev || !next || !close) return;

  let lastFocusedElement = null;

  const lockLightboxScroll = () => {
    portfolioState.scrollLockY = window.scrollY;
    document.documentElement.classList.add("lightbox-open");
    document.body.classList.add("lightbox-open");
    document.body.style.top = `-${portfolioState.scrollLockY}px`;
  };

  const unlockLightboxScroll = () => {
    const y = portfolioState.scrollLockY || 0;
    document.documentElement.classList.remove("lightbox-open");
    document.body.classList.remove("lightbox-open");
    document.body.style.top = "";
    window.scrollTo(0, y);
  };

  const closeLightbox = () => {
    if (overlay.hidden) return;
    overlay.hidden = true;
    image.src = "";
    image.alt = "";
    unlockLightboxScroll();
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  };

  const showImage = (index) => {
    if (!portfolioState.lightboxImages.length) return;
    const normalizedIndex = (index + portfolioState.lightboxImages.length) % portfolioState.lightboxImages.length;
    portfolioState.lightboxIndex = normalizedIndex;
    const item = portfolioState.lightboxImages[normalizedIndex];
    image.src = item.src;
    image.alt = item.alt || "Expanded photograph";
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-lightbox-src]");
    if (!trigger) return;

    event.preventDefault();
    lastFocusedElement = trigger;

    const group = trigger.dataset.lightboxGroup;
    const triggers = Array.from(document.querySelectorAll(`[data-lightbox-group="${cssEscape(group)}"]`));

    portfolioState.lightboxImages = triggers.map((item) => ({
      src: item.dataset.lightboxSrc,
      alt: item.querySelector("img")?.alt || "Expanded photograph"
    }));

    portfolioState.lightboxIndex = Math.max(0, triggers.indexOf(trigger));
    lockLightboxScroll();
    overlay.hidden = false;
    showImage(portfolioState.lightboxIndex);
    close.focus();
  });

  prev.addEventListener("click", () => showImage(portfolioState.lightboxIndex - 1));
  next.addEventListener("click", () => showImage(portfolioState.lightboxIndex + 1));
  close.addEventListener("click", closeLightbox);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (overlay.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showImage(portfolioState.lightboxIndex - 1);
    if (event.key === "ArrowRight") showImage(portfolioState.lightboxIndex + 1);
  });
}

/* =========================================
   CONTACT
========================================= */
function initContactPopup() {
  const popup = document.getElementById("pop_up");
  const form = document.getElementById("contactForm");

  window.openPopup = () => popup?.classList.add("active");
  window.closePopup = () => popup?.classList.remove("active");

  if (window.location.hash === "#pop_up" && popup) {
    popup.classList.add("active");
  }

  popup?.addEventListener("click", (event) => {
    if (event.target === popup) window.closePopup();
  });

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending…";
    }

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form)
      });

      if (!response.ok && response.type !== "opaque") {
        throw new Error(`Form request failed (${response.status})`);
      }

      form.reset();
      window.openPopup();
    } catch (error) {
      console.error("Contact form error:", error);
      alert("There was an error sending the message. Please try again.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Start a Project";
      }
    }
  });
}

/* =========================================
   COPYRIGHT + HELPERS
========================================= */
function initCopyright() {
  const copyright = document.getElementById("copyright");
  if (!copyright) return;
  copyright.textContent = `© ${new Date().getFullYear()} Jose Perez. All rights reserved.`;
}

function createRightsMark() {
  const mark = document.createElement("span");
  mark.className = "image-rights-mark";
  mark.textContent = "© Jose Perez · Usage restricted";
  mark.setAttribute("aria-hidden", "true");
  return mark;
}

function initImageProtection() {
  document.addEventListener("contextmenu", (event) => {
    if (event.target.closest(".protected-photo, [data-lightbox-src] img")) {
      event.preventDefault();
    }
  });

  document.addEventListener("dragstart", (event) => {
    if (event.target.closest(".protected-photo, [data-lightbox-src] img")) {
      event.preventDefault();
    }
  });
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value = "") {
  return escapeHTML(value);
}

function cssEscape(value = "") {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}
