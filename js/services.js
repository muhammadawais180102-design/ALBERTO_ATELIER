"use strict";



/* HEADER */



const header = document.getElementById("siteHeader");

const backTop = document.getElementById("backTop");



function updateScrollState() {

  header.classList.toggle("scrolled",window.scrollY > 40);

  backTop.classList.toggle("show",window.scrollY > 500);

}



window.addEventListener("scroll",updateScrollState,{

  passive:true

});



updateScrollState();



/* MOBILE NAVIGATION */



const menuToggle = document.getElementById("menuToggle");

const navLinks = document.getElementById("navLinks");



function closeMenu() {

  navLinks.classList.remove("open");

  document.body.classList.remove("menu-open");



  menuToggle.setAttribute("aria-expanded","false");

  menuToggle.setAttribute("aria-label","Open menu");



  menuToggle.innerHTML = '<i class="bi bi-list"></i>';

}



menuToggle.addEventListener("click",() => {

  const isOpen = navLinks.classList.toggle("open");



  document.body.classList.toggle("menu-open",isOpen);



  menuToggle.setAttribute("aria-expanded",String(isOpen));



  menuToggle.setAttribute(

    "aria-label",

    isOpen ? "Close menu" : "Open menu"

  );



  menuToggle.innerHTML = isOpen

    ? '<i class="bi bi-x-lg"></i>'

    : '<i class="bi bi-list"></i>';

});



navLinks.querySelectorAll("a").forEach(link => {

  link.addEventListener("click",closeMenu);

});



document.addEventListener("keydown",event => {

  if(event.key === "Escape") {

    closeMenu();

  }

});



document.addEventListener("click",event => {

  if(

    navLinks.classList.contains("open") &&

    !navLinks.contains(event.target) &&

    !menuToggle.contains(event.target)

  ) {

    closeMenu();

  }

});



window.addEventListener("resize",() => {

  if(window.innerWidth > 900) {

    closeMenu();

  }

});



/* SCROLL REVEAL */



const revealElements = document.querySelectorAll(".reveal");



if("IntersectionObserver" in window) {

  const revealObserver = new IntersectionObserver(

    (entries,observer) => {

      entries.forEach(entry => {

        if(entry.isIntersecting) {

          entry.target.classList.add("visible");

          observer.unobserve(entry.target);

        }

      });

    },

    {

      threshold:.1,

      rootMargin:"0px 0px -25px 0px"

    }

  );



  revealElements.forEach(element => {

    revealObserver.observe(element);

  });

} else {

  revealElements.forEach(element => {

    element.classList.add("visible");

  });

}



/* GOLD PARTICLES */



const particleContainer = document.getElementById("particles");



const reduceMotion = window.matchMedia(

  "(prefers-reduced-motion: reduce)"

).matches;



if(!reduceMotion) {

  const particleCount = window.innerWidth < 650 ? 16 : 38;



  for(let i = 0;i < particleCount;i++) {

    const particle = document.createElement("span");



    particle.className = "particle";



    particle.style.setProperty(

      "--size",(Math.random()*2.5+1).toFixed(1)+"px"

    );



    particle.style.setProperty(

      "--left",(Math.random()*100).toFixed(1)+"%"

    );



    particle.style.setProperty(

      "--duration",(Math.random()*14+12).toFixed(1)+"s"

    );



    particle.style.setProperty(

      "--delay",(-Math.random()*25).toFixed(1)+"s"

    );



    particleContainer.appendChild(particle);

  }

}



/* CART COUNT — SAME STORAGE KEY AS PRODUCT & CART */



const CART_KEY = "alberto_atelier_cart_v1";



function updateCartCount() {

  let count = 0;



  try {

    const cart = JSON.parse(localStorage.getItem(CART_KEY));



    if(Array.isArray(cart)) {

      count = cart.reduce((sum,item) => {

        const quantity = Number(item.quantity);



        return sum + (

          Number.isFinite(quantity) && quantity > 0

            ? Math.floor(quantity)

            : 0

        );

      },0);

    }

  } catch(error) {

    console.warn("Unable to read cart:",error);

  }



  const badge = document.getElementById("cartCount");



  badge.textContent = count > 99 ? "99+" : count;

  badge.classList.toggle("show",count > 0);

}



updateCartCount();



window.addEventListener("storage",event => {

  if(event.key === CART_KEY) {

    updateCartCount();

  }

});



/* SERVICE MODAL CONTENT */



const serviceDetails = {

  collections:{

    title:"Exclusive Collections",

    icon:"bi-gem",

    description:

      "Discover a selection of elegant timepieces inspired by modern sophistication, timeless beauty and distinctive personal style. Browse our collection to compare available designs and discover your preferred aesthetic."

  },

  gifting:{

    title:"Luxury Gifting",

    icon:"bi-gift",

    description:

      "Explore watch styles suited to birthdays, anniversaries, professional milestones and other meaningful occasions. Contact Alberto Atelier for product details and gifting-related inquiries. Gift wrapping and delivery options require separate confirmation."

  },

  assistance:{

    title:"Personal Assistance",

    icon:"bi-person-check",

    description:

      "Looking for more information about a design in our collection? Contact our team through the website contact page to ask questions about listed products and available options."

  },

  selection:{

    title:"Watch Selection",

    icon:"bi-watch",

    description:

      "Explore different collections, compare design styles and create your own shortlist by adding favourite products to the shopping bag. This digital showcase makes it easy to organize your selections."

  },

  experience:{

    title:"Signature Experience",

    icon:"bi-stars",

    description:

      "Experience Alberto Atelier's premium digital presentation, featuring cinematic watch imagery, refined typography and an elegant environment inspired by the artistry of luxury timepieces."

  },

  contact:{

    title:"Customer Inquiries",

    icon:"bi-chat-dots",

    description:

      "Reach out through the Contact page for general questions, collection information and product-related inquiries. Our published contact details are also available at the bottom of this page."

  }

};



const serviceModal = document.getElementById("serviceModal");

const modalClose = document.getElementById("modalClose");

const modalPanel = document.getElementById("modalPanel");



let lastFocusedElement = null;



function openServiceModal(key) {

  const service = serviceDetails[key];



  if(!service) return;



  lastFocusedElement = document.activeElement;



  document.getElementById("modalTitle").textContent =

    service.title;



  document.getElementById("modalDescription").textContent =

    service.description;



  const modalIcon = document.getElementById("modalIcon");

  modalIcon.replaceChildren();



  const icon = document.createElement("i");

  icon.className = "bi " + service.icon;

  modalIcon.appendChild(icon);



  serviceModal.classList.add("show");

  serviceModal.setAttribute("aria-hidden","false");



  document.body.classList.add("modal-open-custom");



  modalClose.focus();

}



function closeServiceModal() {

  if(!serviceModal.classList.contains("show")) return;



  serviceModal.classList.remove("show");

  serviceModal.setAttribute("aria-hidden","true");



  document.body.classList.remove("modal-open-custom");



  if(lastFocusedElement &&

     typeof lastFocusedElement.focus === "function") {

    lastFocusedElement.focus();

  }

}



/* OPEN MODAL BUTTONS */



document.querySelectorAll("[data-service]").forEach(button => {

  button.addEventListener("click",() => {

    openServiceModal(button.dataset.service);

  });

});



/* CLOSE MODAL */



modalClose.addEventListener("click",closeServiceModal);



serviceModal.addEventListener("click",event => {

  if(event.target === serviceModal) {

    closeServiceModal();

  }

});



/* KEYBOARD MODAL ACCESSIBILITY */



document.addEventListener("keydown",event => {

  if(!serviceModal.classList.contains("show")) return;



  if(event.key === "Escape") {

    event.preventDefault();

    closeServiceModal();

    return;

  }



  if(event.key === "Tab") {

    const focusable = Array.from(

      modalPanel.querySelectorAll(

        'a[href],button:not([disabled])'

      )

    );



    const first = focusable[0];

    const last = focusable[focusable.length - 1];



    if(!first || !last) return;



    if(event.shiftKey &&

       document.activeElement === first) {

      event.preventDefault();

      last.focus();

    } else if(!event.shiftKey &&

              document.activeElement === last) {

      event.preventDefault();

      first.focus();

    }

  }

});



/* BACK TO TOP */



backTop.addEventListener("click",() => {

  window.scrollTo({

    top:0,

    behavior:reduceMotion ? "auto" : "smooth"

  });

});



/* COPYRIGHT YEAR */



document.getElementById("currentYear").textContent =

  new Date().getFullYear();
