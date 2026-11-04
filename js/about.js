"use strict";



/* HEADER SCROLL */

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



/* MOBILE MENU */

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

  if(event.key === "Escape") closeMenu();

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

  if(window.innerWidth > 900) closeMenu();

});



/* REVEAL ANIMATIONS */

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



/* BACK TO TOP */

backTop.addEventListener("click",() => {

  window.scrollTo({

    top:0,

    behavior:reduceMotion ? "auto" : "smooth"

  });

});



/* CURRENT YEAR */

document.getElementById("currentYear").textContent =

  new Date().getFullYear();
