  
document.addEventListener("DOMContentLoaded", () => {

    const sections = document.querySelectorAll(".fade-section");
  
    // Crear cuadritos dentro del overlay
    sections.forEach(section => {
      const overlay = section.querySelector(".pixel-overlay");
      const total = 20 * 20;
  
      for(let i=0; i<total; i++){
        const block = document.createElement("div");
        overlay.appendChild(block);
      }
    });
  
    // Animación de cuadritos
    function animateSection(section){
      const blocks = section.querySelectorAll(".pixel-overlay div");
      blocks.forEach((block, index) => {
        setTimeout(() => {
          block.style.opacity = "0";
        }, Math.random() * 1000);
      });
    }
  
    // IntersectionObserver
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          animateSection(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
  
    sections.forEach(section => observer.observe(section));
  });
  
  //==================================== Botón flotante móvil
  const mobileBtn = document.querySelector('#mobile-menu-btn');
  const mobileLink = document.querySelector('#mobile-menu-btn a');
  const introSection = document.getElementById('sec_1');
  
  // Mostrar u ocultar el botón según scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
      mobileBtn.classList.add('show');   // mostrar si no estamos en top
    } else {
      mobileBtn.classList.remove('show'); // ocultar si estamos en top
    }
  });
  
  // Scroll suave al hacer clic
  mobileLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (introSection) {
      introSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
  //=================================================CONTACT
  document.querySelectorAll('.input-box').forEach(box => {
        const field = box.querySelector('input');
      
        if (!field) return;
      
        const update = () => {
          // Si tiene contenido (no solo espacios) o si el field está en foco, marca como has-value
          if (field.value.trim() !== '') box.classList.add('has-value');
          else box.classList.remove('has-value');
        };
      
  
        // Eventos que actualizan el estado
        field.addEventListener('input', update);
        // Ejecutar una vez en carga (por si hay value pre-llenado)
        update();
      }); 
  
  
    window.addEventListener("DOMContentLoaded", () => {
    if(window.location.hash === "#pop_up") {
      document.getElementById("pop_up").classList.add("active");
    }
  });
  
  
  const popup = document.getElementById("pop_up");
  const form = document.getElementById("contactForm");
  
  function openPopup(){
    if(popup) popup.classList.add("active");
  }
  
  function closePopup(){
    if(popup) popup.classList.remove("active");
    window.scrollTo(0,0);
  }
  
  // cerrar si hacen click fuera del popup

  if (popup) {
    popup.addEventListener("click", (e) => {
      if (e.target === popup) closePopup();
    });
     // cerrar con ESC
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") closePopup();
  });
  }
  

if (form) {
// enviar formulario sin recargar
form.addEventListener("submit", function(e){
    e.preventDefault();  
    fetch(form.action, {
      method: "POST",
      body: new FormData(form)
    })
    .then((response) => {
      if(response.ok || response.type === "opaque"){ 
        // FormSubmit devuelve "opaque" porque no permite CORS, pero se envía
        openPopup();
        form.reset();
      } else {
        alert("There was an error sending the message.");
      }
    })
    .catch(() => alert("Network error. Please try again."));
  });
}
 
  
  
  //==================================================myWork
  const carousel = document.getElementById("carrusel");

  if (carousel) {
  
    const workSection = document.getElementById("work");
    const images = Array.from(carousel.getElementsByClassName("carousel-item"));
  
   
  let positions = []; // array que guarda la posición de cada imagen
  
  // Inicializamos las posiciones
  function initPositions() {
    const len = images.length;
    positions = [];
    for (let i = 0; i < len; i++) {
      if (i === 0) positions.push("center");
      else if (i % 2 === 1) positions.push("right");
      else positions.push("left");
    }
    updateCarousel();
  }

  // Función que actualiza estilos según la posición
  
  const maxPairs = 3;   // máximo de capas visibles a cada lado
  const baseGap = 5;    // rem de separación horizontal
  const scaleStep = 0.1;
  let currentIndex = 0;
  
  function updateCarousel() {
    const isMobile = window.innerWidth <= 768;
    const total = images.length;
  
    images.forEach((img, i) => {
      let offset = i - currentIndex;
      // ciclo infinito
      if (offset < -Math.floor(total / 2)) offset += total;
      if (offset > Math.floor(total / 2)) offset -= total;
      const absOffset = Math.abs(offset);
  
      let x = 0;
      let scale = 1;
      let rotateY = 0;
      let zIndex = 0;
      let yOffset = 0;
  
      if (offset === 0) {
    scale = 1.1;
    zIndex = 10;
  
    document.getElementById("carousel-title").textContent =
      img.dataset.title || "";
  
    // Obtener el background real
    const bg = getComputedStyle(img).backgroundImage;
    workSection.style.setProperty("--bg-image", bg);
    
  } else {
        const pairIndex = Math.min(absOffset, maxPairs);
  
        scale = 1 - scaleStep * pairIndex;
        rotateY = offset > 0 ? -20 : 20;
        yOffset = pairIndex * 0.3;
        zIndex = 10 - pairIndex;
  
        //mobile 
        if (!isMobile) {
            
          x = (offset > 0 ? 4 : -4) * baseGap * pairIndex;
        }
      }
      img.style.transform = ` translate( calc(-50% + ${x}rem),  calc(-50% + ${yOffset}rem) ) scale(${scale})  rotateY(${rotateY}deg)  `;
      img.style.zIndex = zIndex;
      if (offset === 0) {
        img.style.filter = "none"; // imagen central sin filtro
    } else {
        img.style.filter = "brightness(0.5) blur(5px)"; // las demás más oscuras y borrosas
         img.style.pointerEvents = "none"; // deshabilitar click
    }
    });
  }
  
  // Botones
  document.getElementById("next").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateCarousel();
  });
  document.getElementById("prev").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateCarousel();
  });
  
  updateCarousel();
  // Botones
  document.getElementById("next").addEventListener("click", next);
  document.getElementById("prev").addEventListener("click", prev);
  
  // Inicializamos
  initPositions();
  
  let startX = 0;
  let endX = 0;
  
  carousel.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });
  
  carousel.addEventListener("touchend", e => {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const diff = startX - endX;
  
    if (Math.abs(diff) < 50) return; // ignora toques pequeños
  
    if (diff > 0) next();
    else prev();
  }  
  
  }
  
  //=============================================GALERIAAAAAAAA 
  document.addEventListener("DOMContentLoaded", () => {
  
  // Leer servicio desde URL
  // Elegir galería según URL o fallback general
  const params = new URLSearchParams(window.location.search);
  const serviceKey = params.get("service") || "photography"; // "photography" es la galería general
  sessionStorage.setItem("selectedService", serviceKey.toLowerCase());
  const service = sessionStorage.getItem("selectedService");
  
  // Contenedores
  const container = document.getElementById("gallery_grid");
  const g_hero = document.getElementById("d_sub_grid0");
  const title = document.getElementById("gallery_title");
  const desc = document.getElementById("gallery_desc");

  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.paddingBottom = "4rem";
  
  // Overlay elementos
  const overlay = document.getElementById("popupOverlay");
  const imgBig = document.getElementById("popupImage");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  
  //Variables globales para navegación
  let currentIndex = 0;
  let imagesList = [];
  
  // Cargar JSON
  fetch("data/data.json")
    .then(res => res.json())
    .then(data => {
  
      const galleryData = data.galleries[serviceKey] || data.galleries.photography;
  
      // Título   
      title.textContent = galleryData.title;
      if (g_hero && galleryData.hero) {
        g_hero.style.backgroundImage = `url(${galleryData.hero})`;
      }
      // Descripción
      if (galleryData.description) {      
        desc.textContent = galleryData.description;   
      }
  
      // Contenedor de imágenes
      const otro_container = document.createElement("div");
      otro_container.className = "gallery_grid";
      container.appendChild(otro_container);
  
      //  Crear array de imágenes
      imagesList = Array.from(
        { length: galleryData.count || 18 },
        (_, i) => `${galleryData.src}/0-${i + 1}.jpg`
      );
  
      // Mezclar
      for (let i = imagesList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [imagesList[i], imagesList[j]] = [imagesList[j], imagesList[i]];
      }
  
      // Pintar imágenes
      imagesList.forEach((src, index) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = galleryData.title;
        otro_container.appendChild(img);
  
        img.addEventListener("click", () => {
          currentIndex = index;
          imgBig.src = src;
          overlay.style.display = "flex";
        });
      });
  
    })
    .catch(error => console.error("Error loading gallery:", error));
  
  //Navegación
  function showNext() {
    currentIndex = (currentIndex + 1) % imagesList.length;
    imgBig.src = imagesList[currentIndex];
  }
  function showPrev() {
    currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
    imgBig.src = imagesList[currentIndex];
  }
  
  nextBtn.addEventListener("click", e => { e.stopPropagation(); showNext(); });
  prevBtn.addEventListener("click", e => { e.stopPropagation(); showPrev(); });
  
  // 9Cerrar overlay
  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.style.display = "none";
  });
  
  // Teclado
  document.addEventListener("keydown", e => {
    if (overlay.style.display !== "flex") return;
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "Escape") overlay.style.display = "none";
  });
  
  });
  
  
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