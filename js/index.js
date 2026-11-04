"use strict";



/* ===================================

   MOBILE NAVIGATION

=================================== */



const menuBtn = document.getElementById("menuBtn");

const navMenu = document.getElementById("navMenu");



function closeMenu() {

  navMenu.classList.remove("open");

  document.body.classList.remove("menu-open");



  menuBtn.setAttribute("aria-expanded","false");

  menuBtn.setAttribute("aria-label","Open menu");



  menuBtn.innerHTML = '<i class="bi bi-list"></i>';

}



menuBtn.addEventListener("click",() => {

  const opened = navMenu.classList.toggle("open");



  document.body.classList.toggle("menu-open",opened);

  menuBtn.setAttribute("aria-expanded",String(opened));



  menuBtn.innerHTML = opened

    ? '<i class="bi bi-x-lg"></i>'

    : '<i class="bi bi-list"></i>';

});



navMenu.querySelectorAll("a").forEach(link => {

  link.addEventListener("click",closeMenu);

});



document.addEventListener("keydown",event => {

  if(event.key === "Escape") {

    closeMenu();

  }

});



document.addEventListener("click",event => {

  if(

    navMenu.classList.contains("open") &&

    !navMenu.contains(event.target) &&

    !menuBtn.contains(event.target)

  ) {

    closeMenu();

  }

});



window.addEventListener("resize",() => {

  if(window.innerWidth > 900) closeMenu();

});



/* ===================================

   HEADER & BACK TO TOP

=================================== */



const header = document.getElementById("header");

const backTop = document.getElementById("backTop");



function handleScroll() {

  header.classList.toggle("scrolled",window.scrollY > 35);

  backTop.classList.toggle("show",window.scrollY > 500);

}



window.addEventListener("scroll",handleScroll,{

  passive:true

});



handleScroll();



const reduceMotion = window.matchMedia(

  "(prefers-reduced-motion: reduce)"

).matches;



backTop.addEventListener("click",() => {

  window.scrollTo({

    top:0,

    behavior:reduceMotion ? "auto" : "smooth"

  });

});



/* ===================================

   SCROLL REVEAL

=================================== */



const revealItems = document.querySelectorAll(".reveal");



if("IntersectionObserver" in window) {

  const observer = new IntersectionObserver(

    entries => {

      entries.forEach(entry => {

        if(entry.isIntersecting) {

          entry.target.classList.add("visible");

          observer.unobserve(entry.target);

        }

      });

    },

    {

      threshold:.08,

      rootMargin:"0px 0px -20px 0px"

    }

  );



  revealItems.forEach(item => observer.observe(item));

} else {

  revealItems.forEach(item => {

    item.classList.add("visible");

  });

}



/* ===================================

   FLOATING GOLD PARTICLES

=================================== */



if(!reduceMotion) {

  const layer = document.getElementById("particles");

  const count = window.innerWidth < 650 ? 15 : 35;



  for(let i=0;i<count;i++) {

    const particle = document.createElement("span");

    particle.className = "particle";



    particle.style.setProperty(

      "--x",Math.random()*100+"%"

    );



    particle.style.setProperty(

      "--s",(Math.random()*2.5+1)+"px"

    );



    particle.style.setProperty(

      "--t",(Math.random()*14+12)+"s"

    );



    particle.style.setProperty(

      "--d",(-Math.random()*25)+"s"

    );



    layer.appendChild(particle);

  }

}



/* ===================================

   CART COUNT

   COMPATIBLE WITH PRODUCT.HTML

=================================== */



const CART_KEY = "alberto_atelier_cart_v1";



function updateCartBadge() {

  const badge = document.getElementById("cartBadge");



  let count = 0;



  try {

    const cart = JSON.parse(

      localStorage.getItem(CART_KEY) || "[]"

    );



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

    console.warn("Cart could not be loaded:",error);

  }



  badge.textContent = count > 99 ? "99+" : count;

  badge.classList.toggle("show",count > 0);

}



updateCartBadge();



window.addEventListener("storage",event => {

  if(event.key === CART_KEY) {

    updateCartBadge();

  }

});



window.addEventListener("pageshow",updateCartBadge);



/* ===================================

   COPYRIGHT

=================================== */



document.getElementById("year").textContent =

  new Date().getFullYear();
