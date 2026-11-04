"use strict";



/* =====================================

   HEADER SCROLL

===================================== */



const header = document.getElementById("siteHeader");

const backTop = document.getElementById("backTop");



function updateScrollState() {

  header.classList.toggle("scrolled", window.scrollY > 40);

  backTop.classList.toggle("show", window.scrollY > 500);

}



window.addEventListener("scroll", updateScrollState, {

  passive:true

});



updateScrollState();



/* =====================================

   MOBILE NAVIGATION

===================================== */



const menuToggle = document.getElementById("menuToggle");

const navLinks = document.getElementById("navLinks");



function closeMenu() {

  navLinks.classList.remove("open");

  document.body.classList.remove("menu-open");



  menuToggle.setAttribute("aria-expanded", "false");

  menuToggle.setAttribute("aria-label", "Open menu");



  menuToggle.innerHTML = '<i class="bi bi-list"></i>';

}



menuToggle.addEventListener("click", () => {

  const isOpen = navLinks.classList.toggle("open");



  document.body.classList.toggle("menu-open", isOpen);



  menuToggle.setAttribute("aria-expanded", String(isOpen));



  menuToggle.setAttribute(

    "aria-label",

    isOpen ? "Close menu" : "Open menu"

  );



  menuToggle.innerHTML = isOpen

    ? '<i class="bi bi-x-lg"></i>'

    : '<i class="bi bi-list"></i>';

});



navLinks.querySelectorAll("a").forEach(link => {

  link.addEventListener("click", closeMenu);

});



document.addEventListener("keydown", event => {

  if (event.key === "Escape") closeMenu();

});



document.addEventListener("click", event => {

  if (

    navLinks.classList.contains("open") &&

    !navLinks.contains(event.target) &&

    !menuToggle.contains(event.target)

  ) {

    closeMenu();

  }

});



window.addEventListener("resize", () => {

  if (window.innerWidth > 900) closeMenu();

});



/* =====================================

   SCROLL REVEAL

===================================== */



const revealElements = document.querySelectorAll(".reveal");



if ("IntersectionObserver" in window) {

  const revealObserver = new IntersectionObserver(

    (entries, observer) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

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



/* =====================================

   GOLD PARTICLES

===================================== */



const particleContainer = document.getElementById("particles");



const reduceMotion = window.matchMedia(

  "(prefers-reduced-motion: reduce)"

).matches;



if (!reduceMotion) {

  const particleCount = window.innerWidth < 650 ? 16 : 38;



  for (let i = 0; i < particleCount; i++) {

    const particle = document.createElement("span");



    particle.className = "particle";



    particle.style.setProperty(

      "--size", (Math.random() * 2.5 + 1).toFixed(1) + "px"

    );



    particle.style.setProperty(

      "--left", (Math.random() * 100).toFixed(1) + "%"

    );



    particle.style.setProperty(

      "--duration", (Math.random() * 14 + 12).toFixed(1) + "s"

    );



    particle.style.setProperty(

      "--delay", (-Math.random() * 25).toFixed(1) + "s"

    );



    particleContainer.appendChild(particle);

  }

}



/* =====================================

   CART COUNT

===================================== */



const CART_KEY = "alberto_atelier_cart_v1";



function updateCartCount() {

  let count = 0;



  try {

    const cart = JSON.parse(localStorage.getItem(CART_KEY));



    if (Array.isArray(cart)) {

      count = cart.reduce((sum, item) => {

        const quantity = Number(item.quantity);



        return sum + (

          Number.isFinite(quantity) && quantity > 0

            ? Math.floor(quantity)

            : 0

        );

      }, 0);

    }

  } catch (error) {

    console.warn("Unable to read cart:", error);

  }



  const badge = document.getElementById("cartCount");



  badge.textContent = count > 99 ? "99+" : count;

  badge.classList.toggle("show", count > 0);

}



updateCartCount();



window.addEventListener("storage", event => {

  if (event.key === CART_KEY) updateCartCount();

});



/* =====================================

   FORM VALIDATION

===================================== */



const contactForm = document.getElementById("contactForm");

const formFeedback = document.getElementById("formFeedback");



const fields = {

  firstName:document.getElementById("firstName"),

  lastName:document.getElementById("lastName"),

  email:document.getElementById("email"),

  phone:document.getElementById("phone"),

  subject:document.getElementById("subject"),

  message:document.getElementById("message")

};



function setFieldError(fieldName, message) {

  const field = fields[fieldName];

  const error = document.getElementById(fieldName + "Error");



  if (!field || !error) return;



  error.textContent = message;

  field.classList.toggle("invalid", Boolean(message));



  if (message) {

    field.setAttribute("aria-invalid", "true");

    field.setAttribute("aria-describedby", fieldName + "Error");

  } else {

    field.removeAttribute("aria-invalid");

    field.removeAttribute("aria-describedby");

  }

}



function validateField(fieldName) {

  const field = fields[fieldName];

  const value = field.value.trim();

  let error = "";



  switch (fieldName) {

    case "firstName":

      if (value.length < 2) {

        error = "Please enter your first name.";

      }

      break;



    case "lastName":

      if (value.length < 2) {

        error = "Please enter your last name.";

      }

      break;



    case "email":

      if (!field.validity.valid || !value) {

        error = "Please enter a valid email address.";

      }

      break;



    case "phone":

      if (

        value &&

        !/^\+?[0-9\s()\-]{7,25}$/.test(value)

      ) {

        error = "Please enter a valid phone number.";

      }

      break;



    case "subject":

      if (!value) {

        error = "Please select an inquiry subject.";

      }

      break;



    case "message":

      if (value.length < 10) {

        error = "Please enter at least 10 characters.";

      }

      break;

  }



  setFieldError(fieldName, error);



  return !error;

}



/* VALIDATION ON BLUR */



Object.keys(fields).forEach(fieldName => {

  fields[fieldName].addEventListener("blur", () => {

    validateField(fieldName);

  });



  fields[fieldName].addEventListener("input", () => {

    if (fields[fieldName].classList.contains("invalid")) {

      validateField(fieldName);

    }

  });

});



/* =====================================

   CONTACT EMAIL PREPARATION

===================================== */



contactForm.addEventListener("submit", event => {

  event.preventDefault();



  let isValid = true;

  let firstInvalid = null;



  Object.keys(fields).forEach(fieldName => {

    if (!validateField(fieldName)) {

      isValid = false;



      if (!firstInvalid) {

        firstInvalid = fields[fieldName];

      }

    }

  });



  if (!isValid) {

    formFeedback.textContent =

      "Please correct the highlighted fields.";



    if (firstInvalid) firstInvalid.focus();

    return;

  }



  const firstName = fields.firstName.value.trim();

  const lastName = fields.lastName.value.trim();

  const email = fields.email.value.trim();

  const phone = fields.phone.value.trim();

  const subject = fields.subject.value;

  const message = fields.message.value.trim();



  const emailSubject = "Alberto Atelier - " + subject;



  const emailBody = [

    "ALBERTO ATELIER - CUSTOMER INQUIRY",

    "",

    "Name: " + firstName + " " + lastName,

    "Email: " + email,

    "Phone: " + (phone || "Not provided"),

    "Subject: " + subject,

    "",

    "MESSAGE:",

    message

  ].join("\n");



  const mailtoLink =

    "mailto:muhammadawais180102@gmail.com" +

    "?subject=" + encodeURIComponent(emailSubject) +

    "&body=" + encodeURIComponent(emailBody);



  formFeedback.textContent =

    "Your email application should open with a prepared message. Please press Send there.";



  window.location.href = mailtoLink;

});



/* =====================================

   FAQ ACCORDION

===================================== */



const faqButtons = document.querySelectorAll(".faq-question");



function closeFaq(button) {

  const answer = document.getElementById(

    button.getAttribute("aria-controls")

  );



  button.setAttribute("aria-expanded", "false");

  answer.style.maxHeight = "0px";

}



function openFaq(button) {

  const answer = document.getElementById(

    button.getAttribute("aria-controls")

  );



  button.setAttribute("aria-expanded", "true");

  answer.style.maxHeight = answer.scrollHeight + "px";

}



faqButtons.forEach(button => {

  button.addEventListener("click", () => {

    const wasOpen = button.getAttribute("aria-expanded") === "true";



    faqButtons.forEach(closeFaq);



    if (!wasOpen) openFaq(button);

  });

});



window.addEventListener("resize", () => {

  faqButtons.forEach(button => {

    if (button.getAttribute("aria-expanded") === "true") {

      const answer = document.getElementById(

        button.getAttribute("aria-controls")

      );



      answer.style.maxHeight = answer.scrollHeight + "px";

    }

  });

});



/* =====================================

   BACK TO TOP

===================================== */



backTop.addEventListener("click", () => {

  window.scrollTo({

    top:0,

    behavior:reduceMotion ? "auto" : "smooth"

  });

});



/* COPYRIGHT */



document.getElementById("currentYear").textContent =

  new Date().getFullYear();
