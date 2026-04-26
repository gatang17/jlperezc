  
document.addEventListener("DOMContentLoaded", () => {
  initPixelEffect();
  initMobileScrollButton();
  initFloatingLabels();
  initContactPopup();
  initExpertiseCarousel();
  initGallery();
  initHeaderInjection();
  initHeroBackgroundCarousel();
  initCopyright();
});

/* =========================================
   PIXEL EFFECT
========================================= */
function initPixelEffect() {
  const sections = document.querySelectorAll(".fade-section");

  sections.forEach((section) => {
    const overlay = section.querySelector(".pixel-overlay");
    if (!overlay) return;

    const total = 20 * 20;
    overlay.innerHTML = "";

    for (let i = 0; i < total; i++) {
      const block = document.createElement("div");
      overlay.appendChild(block);
    }
  });

  function animateSection(section) {
    const blocks = section.querySelectorAll(".pixel-overlay div");
    blocks.forEach((block) => {
      setTimeout(() => {
        block.style.opacity = "0";
      }, Math.random() * 1000);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateSection(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* =========================================
   FLOATING MOBILE BUTTON
========================================= */
function initMobileScrollButton() {
  const mobileBtn = document.querySelector("#mobile-menu-btn");
  const mobileLink = document.querySelector("#mobile-menu-btn a");
  const introSection = document.getElementById("sec_1");

  if (!mobileBtn || !mobileLink || !introSection) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 0) {
      mobileBtn.classList.add("show");
    } else {
      mobileBtn.classList.remove("show");
    }
  });

  mobileLink.addEventListener("click", (e) => {
    e.preventDefault();
    introSection.scrollIntoView({ behavior: "smooth" });
  });
}

/* =========================================
   FLOATING LABELS
========================================= */
function initFloatingLabels() {
  document.querySelectorAll(".input-box").forEach((box) => {
    const field = box.querySelector("input, textarea");
    if (!field) return;

    const update = () => {
      if (field.value.trim() !== "" || document.activeElement === field) {
        box.classList.add("has-value");
      } else {
        box.classList.remove("has-value");
      }
    };

    field.addEventListener("input", update);
    field.addEventListener("focus", update);
    field.addEventListener("blur", update);

    update();
  });
}

/* =========================================
   CONTACT POPUP + FORM
========================================= */
function initContactPopup() {
  const popup = document.getElementById("pop_up");
  const form = document.getElementById("contactForm");

  if (window.location.hash === "#pop_up" && popup) {
    popup.classList.add("active");
  }

  window.openPopup = function () {
    if (popup) popup.classList.add("active");
  };

  window.closePopup = function () {
    if (popup) popup.classList.remove("active");
  };

  if (popup) {
    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        window.closePopup();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        window.closePopup();
      }
    });
  }

  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    fetch(form.action, {
      method: "POST",
      body: new FormData(form)
    })
      .then((response) => {
        if (response.ok || response.type === "opaque") {
          window.openPopup();
          form.reset();

          document.querySelectorAll(".input-box").forEach((box) => {
            box.classList.remove("has-value");
          });
        } else {
          alert("There was an error sending the message.");
        }
      })
      .catch(() => {
        alert("Network error. Please try again.");
      });
  });
}

/* =========================================
   AREAS OF EXPERTISE CAROUSEL
========================================= */
function initExpertiseCarousel() {
  const carousel = document.getElementById("carrusel");
  const workSection = document.getElementById("work");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const titleEl = document.getElementById("carousel-title");

  if (!carousel || !workSection || !prevBtn || !nextBtn || !titleEl) return;

  const items = Array.from(carousel.querySelectorAll(".carousel-item"));
  if (!items.length) return;

  let currentIndex = 0;
  let startX = 0;
  let endX = 0;

  function updateCarousel() {
    const isMobile = window.innerWidth <= 768;
    const total = items.length;

    items.forEach((item, i) => {
      let offset = i - currentIndex;

      if (offset < -Math.floor(total / 2)) offset += total;
      if (offset > Math.floor(total / 2)) offset -= total;

      const absOffset = Math.abs(offset);

      let x = 0;
      let scale = 1;
      let rotateY = 0;
      let zIndex = 1;
      let yOffset = 0;
      let opacity = 1;

      if (offset === 0) {
        scale = isMobile ? 1 : 1.08;
        zIndex = 10;

        titleEl.textContent = item.dataset.title || "";

        const bg = getComputedStyle(item).backgroundImage;
        workSection.style.setProperty("--bg-image", bg);

        const parentLink = item.closest("a");
        if (parentLink) parentLink.style.pointerEvents = "auto";

        item.style.filter = "none";
        item.style.cursor = "pointer";
      } else {
        const pairIndex = Math.min(absOffset, 3);

        scale = 1 - 0.1 * pairIndex;
        rotateY = offset > 0 ? -20 : 20;
        yOffset = pairIndex * 0.3;
        zIndex = 10 - pairIndex;
        opacity = absOffset > 3 ? 0 : 1;

        if (!isMobile) {
          x = (offset > 0 ? 1 : -1) * 20 * pairIndex;
        }

        const parentLink = item.closest("a");
        if (parentLink) parentLink.style.pointerEvents = "none";

        item.style.filter = "brightness(0.5) blur(5px)";
        item.style.cursor = "default";
      }

      item.style.transform = `
        translate(-50%, -50%)
        translateX(${x}rem)
        translateY(${yOffset}rem)
        scale(${scale})
        rotateY(${rotateY}deg)
      `;
      item.style.zIndex = String(zIndex);
      item.style.opacity = String(opacity);
    });
  }

  function next() {
    currentIndex = (currentIndex + 1) % items.length;
    updateCarousel();
  }

  function prev() {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateCarousel();
  }

  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  carousel.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  carousel.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) < 50) return;

    if (diff > 0) next();
    else prev();
  });

  window.addEventListener("resize", updateCarousel);

  updateCarousel();
}

/* =========================================
   GALLERY
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  initGallery();
});

function initGallery() {
  const params = new URLSearchParams(window.location.search);
  const serviceKey = (params.get("service") || "photography").toLowerCase();

  const container = document.getElementById("gallery_grid");
  const heroPanel = document.getElementById("d_sub_grid0");
  const title = document.getElementById("gallery_title");
  const desc = document.getElementById("gallery_desc");
  const btnViewMore = document.getElementById("btnViewMore");

  const overlay = document.getElementById("popupOverlay");
  const imgBig = document.getElementById("popupImage");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  const mobileToggleBtn = document.getElementById("mobileGalleryToggle");

  if (!container || !overlay || !imgBig || !prevBtn || !nextBtn) return;

  function renderGallery() {
    container.innerHTML = "";
  
    const grid = document.createElement("div");
    grid.className = "gallery_grid";
    container.appendChild(grid);
  
    const isGalleryPage =
      window.location.pathname.includes("gallery.html") ||
      window.location.pathname.includes("gallery");
  
    const imagesToRender = isGalleryPage
      ? imagesList
      : imagesList.slice(0, 8);
  
    imagesToRender.forEach((imgSrc) => {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.className = "gallery-img";
      img.alt = title?.textContent || "Gallery image";
      img.loading = "lazy";
  
      img.addEventListener("click", () => {
        currentIndex = imagesList.indexOf(imgSrc);
        imgBig.src = imagesList[currentIndex];
        overlay.style.display = "flex";
      });
  
      grid.appendChild(img);
    });
  
    if (btnViewMore) {
      if (isGalleryPage) {
        btnViewMore.style.display = "none";
      } else {
        btnViewMore.style.display = "inline-flex";
        btnViewMore.href = `gallery.html?service=${serviceKey}`;
      }
    }
  }

  let currentIndex = 0;
  let imagesList = [];

  fetch("data/data.json")
    .then((res) => res.json())
    .then((data) => {

      const galleryData = data.galleries[serviceKey] || data.galleries.photography;
      if (!galleryData) return;

  
      sessionStorage.setItem("selectedService", serviceKey);

      if (title && (!title.textContent.trim() || serviceKey !== "photography")) {
        title.textContent = galleryData.title || "Selected Work";
      }

      if (desc && (!desc.textContent.trim() || serviceKey !== "photography")) {
        desc.textContent = galleryData.description || "";
      }

      if (heroPanel && galleryData.hero) {
        heroPanel.style.backgroundImage = `url(${galleryData.hero})`;
      }

      
      imagesList = Array.from(
        { length: galleryData.count || 0 },
        (_, i) => `${galleryData.src}/0-${i + 1}.jpg`
      );

      shuffleArray(imagesList);

      
      renderGallery();
    })
    .catch((error) => {
      console.error("Error loading gallery:", error);
    });

  function showNext() {
    if (!imagesList.length) return;
    currentIndex = (currentIndex + 1) % imagesList.length;
    imgBig.src = imagesList[currentIndex];
  }

  function showPrev() {
    if (!imagesList.length) return;
    currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
    imgBig.src = imagesList[currentIndex];
  }

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showNext();
  });

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showPrev();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.style.display = "none";
    }
  });

  document.addEventListener("keydown", (e) => {
    if (overlay.style.display !== "flex") return;

    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "Escape") overlay.style.display = "none";
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
  
  //====================================================header injection
  document.addEventListener("DOMContentLoaded", () => {
    fetch("data/header.html")
      .then(res => res.text())
      .then(html => {
        document.getElementById("header").innerHTML = html;
  
        // --- VARIABLES INICIALES ---
  const divMenu = document.getElementById('div_menutop');       // menú top
  const divFoot = document.getElementById('div_menubotom');     // footer
  const footerStyle = document.getElementById('foot_bar');      // contenedor footer
  const btnHamburguesa = document.getElementById('btnHamburguesa'); // botón hamburguesa
  const elementosBorrosos = document.getElementsByClassName('borroso'); // elementos que se desenfocan
  const menuDrop = document.getElementById('navbarMenu');       // menú desplegable hamburguesa
  const menu_cny = document.getElementById('container_top')
  /* para notas*/ 
  
  // Guardar HTML original
  const menuOriginalHTML = divMenu.innerHTML;
  const footerOriginalHTML = divFoot.innerHTML;
  
  let menuAbierto = false; // estado del menú hamburguesa
  let ultimaPosicionScroll = 0; // posición anterior del scroll
  
  
  // Selecciona todos los enlaces <a>
  // Selecciona todos los enlaces <a>
  const todosLosLinks = document.querySelectorAll("a");
  
  // Recorrerlos y agregar evento
  todosLosLinks.forEach(link => {
    link.addEventListener("click", () => {
      
      document.body.style.overflow = '';
      menuDrop.style.visibility = "hidden";
      for (let i = 0; i < elementosBorrosos.length; i++) {
        elementosBorrosos[i].style.filter = "none";
  
      }
      menuAbierto = false;
    });
  });
  
  // --- FUNCION PARA ACTUALIZAR UI SEGÚN TAMAÑO ---
  function actualizarUI() {
    const ancho = window.innerWidth;
  
    if (ancho < 765) { // móvil
      btnHamburguesa.style.display = "flex";         // botón visible
      menuDrop.style.display = menuAbierto ? "flex" : "none"; // menú hamburguesa
    } else { // desktop o tablet
      btnHamburguesa.style.display = "none";         // botón oculto
      menuDrop.style.display = "flex";               // menú normal visible
      menuAbierto = false;                            // menú hamburguesa cerrado
      // quitar blur
      for (let i = 0; i < elementosBorrosos.length; i++) {
        elementosBorrosos[i].style.filter = "none";
      }
    }
  }
  
  //--- TOGGLE DEL MENU HAMBURGUESA v2---
  btnHamburguesa.addEventListener("click", () => {
    menuAbierto = !menuAbierto;
  
    if (menuAbierto) {
      document.body.style.overflow = 'hidden';
      menuDrop.style.display = 'flex';
      menuDrop.style.visibility = 'visible';   // ← FALTABA
      menuDrop.classList.add('menu-overlay');
  
      for (let i = 0; i < elementosBorrosos.length; i++) {
        elementosBorrosos[i].style.filter = "blur(5px) brightness(0.3)";
      }
  
    } else {
      document.body.style.overflow = '';
      menuDrop.style.display = 'none';
      menuDrop.style.visibility = 'hidden';   // ← FALTABA
      menuDrop.classList.remove('menu-overlay');
  
      for (let i = 0; i < elementosBorrosos.length; i++) {
        elementosBorrosos[i].style.filter = "none";
      }
    }
    menuDrop.addEventListener("click", (e) => {
  
  if (e.target === menuDrop) {
  
    menuAbierto = false;
    menuDrop.style.display = "none";
    menuDrop.style.visibility = "hidden";
    document.body.style.overflow = '';
  
    for (let i = 0; i < elementosBorrosos.length; i++) {
      elementosBorrosos[i].style.filter = "none";
    }
  
  }
  
  });
  });
  
  // --- EFECTO DE SCROLL EN EL TOP ---
  window.addEventListener('scroll', () => {
    const posicionActual = window.scrollY;
  
    // Si está en el tope
    if (posicionActual === 0) {
      menu_cny.style.backgroundColor = "transparent";
      footerStyle.style.backgroundColor = "transparent";
    } else {
      // Si baja o sube (cualquier movimiento de scroll)
      menu_cny.style.backgroundColor = "black";   
     footerStyle.style.backgroundColor = "black";
    }
  
    // Actualiza la posición actual del scroll
    ultimaPosicionScroll = posicionActual;
  });
  
  // --- EVENTOS PARA CARGA Y REDIMENSIÓN ---
  window.addEventListener('load', actualizarUI);
  window.addEventListener('resize', actualizarUI);
      })
      .catch(err => console.error("Header load error", err));
  });
  //=================================Carousel
  document.addEventListener('DOMContentLoaded', () => {
    const cont = document.getElementById('cont_background');
    const images = [
      "images/0-1.jpg",
      "images/0-4.jpg",
      "images/0-2.jpg",
      "images/0-5.jpg",
      "images/0-10.jpg",
      "images/0-21.jpg"
    ];  
    // Crear contenedor
    const divCarrusel = document.createElement('div');
    divCarrusel.id = 'carr_ind';
    cont.appendChild(divCarrusel);
  
    // aqui esta el efecto fade!!!!!!
    images.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.className = 'img_carr';
      img.style.position = 'absolute';
      img.style.filter= 'brightnes(0.1)'
      img.style.top = '0';
      img.style.left = '0';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'top';
      img.style.opacity = i === 0 ? '1' : '0';
      img.style.transition = 'opacity 3s ease-in-out';
      img.style.zIndex='0';
      divCarrusel.appendChild(img);
    });
  
    let current = 0;
    setInterval(() => {
      const imgs = divCarrusel.querySelectorAll('.img_carr');
      const next = (current + 1) % imgs.length;
      imgs[current].style.opacity = '0.0';
      imgs[next].style.opacity = '1';
      current = next;
    }, 5000);
  });