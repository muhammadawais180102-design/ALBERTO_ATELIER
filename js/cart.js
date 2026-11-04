"use strict";



/*

  SAME STORAGE FORMAT AS product.html



  Key:

  alberto_atelier_cart_v1



  Item:

  {

    id,

    name,

    price,

    image,

    category,

    quantity

  }



  Maximum quantity per item: 99

  Currency: PKR

*/



const CART_KEY = "alberto_atelier_cart_v1";

const MAX_QUANTITY = 99;



const cartItems = document.getElementById("cartItems");

const cartCount = document.getElementById("cartCount");

const clearCartBtn = document.getElementById("clearCart");

const checkoutBtn = document.getElementById("checkoutBtn");

const checkoutMessage = document.getElementById("checkoutMessage");

const cartToast = document.getElementById("cartToast");



const currencyFormatter = new Intl.NumberFormat("en-PK", {

  style:"currency",

  currency:"PKR",

  maximumFractionDigits:0

});



let toastTimer;



function formatPrice(value) {

  return currencyFormatter.format(value);

}



/* READ CART */



function getCart() {

  try {

    const saved = JSON.parse(localStorage.getItem(CART_KEY));



    if (!Array.isArray(saved)) return [];



    return saved

      .filter(item =>

        item &&

        typeof item.id === "string" &&

        typeof item.name === "string" &&

        Number.isFinite(Number(item.price)) &&

        Number(item.price) >= 0 &&

        Number.isFinite(Number(item.quantity)) &&

        Number(item.quantity) > 0

      )

      .map(item => ({

        id:item.id,

        name:item.name,

        price:Number(item.price),

        image:typeof item.image === "string" ? item.image : "",

        category:typeof item.category === "string" ? item.category : "",

        quantity:Math.min(

          MAX_QUANTITY,

          Math.max(1,Math.floor(Number(item.quantity)))

        )

      }));

  } catch (error) {

    console.warn("Unable to load cart:",error);

    return [];

  }

}



/* SAVE CART */



function saveCart(cart) {

  try {

    localStorage.setItem(CART_KEY,JSON.stringify(cart));

    return true;

  } catch (error) {

    console.error("Unable to save cart:",error);

    showToast("Unable to save cart. Check browser storage.");

    return false;

  }

}



/* TOTALS */



function calculateTotals(cart) {

  const quantity = cart.reduce(

    (sum,item) => sum + item.quantity,0

  );



  const subtotal = cart.reduce(

    (sum,item) => sum + item.price * item.quantity,0

  );



  return {quantity,subtotal};

}



/* CART NOTIFICATION */



function showToast(message) {

  clearTimeout(toastTimer);

  cartToast.textContent = message;

  cartToast.classList.add("show");



  toastTimer = setTimeout(() => {

    cartToast.classList.remove("show");

  },3000);

}



/* CREATE ELEMENT HELPERS */



function createElement(tag,className,text) {

  const element = document.createElement(tag);



  if (className) element.className = className;

  if (text !== undefined) element.textContent = text;



  return element;

}



/* CREATE CART ITEM */



function createCartItem(item) {

  const article = createElement("article","cart-item");



  const image = createElement("img","cart-image");

  image.src = item.image;

  image.alt = item.name;

  image.loading = "lazy";



  const body = createElement("div","cart-item-body");



  const category = createElement(

    "span",

    "cart-category",

    item.category ? item.category + " Collection" : "Alberto Atelier"

  );



  const title = createElement("h3","cart-title",item.name);



  const unitPrice = createElement(

    "p",

    "cart-unit-price",

    "Unit Price: " + formatPrice(item.price)

  );



  const actions = createElement("div","cart-item-actions");



  const quantityControl = createElement("div","quantity-control");



  const minus = createElement("button","quantity-btn");

  minus.type = "button";

  minus.setAttribute("aria-label","Decrease quantity of " + item.name);

  minus.textContent = "−";



  const value = createElement(

    "span","quantity-value",String(item.quantity)

  );



  const plus = createElement("button","quantity-btn");

  plus.type = "button";

  plus.setAttribute("aria-label","Increase quantity of " + item.name);

  plus.textContent = "+";

  plus.disabled = item.quantity >= MAX_QUANTITY;



  minus.addEventListener("click",() => {

    changeQuantity(item.id,-1);

  });



  plus.addEventListener("click",() => {

    changeQuantity(item.id,1);

  });



  quantityControl.append(minus,value,plus);



  const remove = createElement("button","remove-btn");

  remove.type = "button";

  remove.setAttribute("aria-label","Remove " + item.name);

  remove.innerHTML = '<i class="bi bi-trash3"></i> Remove';



  remove.addEventListener("click",() => {

    removeItem(item.id);

  });



  actions.append(quantityControl,remove);



  const lineTotal = createElement(

    "p",

    "cart-line-total",

    formatPrice(item.price * item.quantity)

  );



  body.append(category,title,unitPrice,actions,lineTotal);

  article.append(image,body);



  return article;

}



/* EMPTY CART */



function createEmptyCart() {

  const wrapper = createElement("div","empty-cart");



  const iconWrap = createElement("div","empty-icon");

  const icon = createElement("i","bi bi-bag-x");

  iconWrap.appendChild(icon);



  const title = createElement(

    "h2",null,"Your Bag Is Empty"

  );



  const message = createElement(

    "p",

    null,

    "Your private collection awaits. Discover extraordinary timepieces and add your favourites."

  );



  const link = createElement("a","luxury-btn gold");

  link.href = "product.html";

  link.innerHTML =

    'Explore Collection <i class="bi bi-arrow-up-right"></i>';



  wrapper.append(iconWrap,title,message,link);



  return wrapper;

}



/* RENDER CART */



function renderCart() {

  const cart = getCart();

  const totals = calculateTotals(cart);



  cartItems.replaceChildren();



  if (cart.length === 0) {

    cartItems.appendChild(createEmptyCart());

  } else {

    const fragment = document.createDocumentFragment();



    cart.forEach(item => {

      fragment.appendChild(createCartItem(item));

    });



    cartItems.appendChild(fragment);

  }



  document.getElementById("summaryQuantity").textContent =

    String(totals.quantity);



  document.getElementById("summarySubtotal").textContent =

    formatPrice(totals.subtotal);



  document.getElementById("summaryTotal").textContent =

    formatPrice(totals.subtotal);



  cartCount.textContent =

    totals.quantity > 99 ? "99+" : String(totals.quantity);



  cartCount.classList.toggle("show",totals.quantity > 0);



  clearCartBtn.disabled = cart.length === 0;

  checkoutBtn.disabled = cart.length === 0;
  renderBagRecommendations();

}



/* CHANGE QUANTITY */



function changeQuantity(productId,delta) {

  const cart = getCart();

  const item = cart.find(product => product.id === productId);



  if (!item) return;



  item.quantity = Math.min(

    MAX_QUANTITY,

    item.quantity + delta

  );



  if (item.quantity <= 0) {

    const updated = cart.filter(product => product.id !== productId);



    if (saveCart(updated)) {

      renderCart();

      showToast("Item removed from your bag.");

    }



    return;

  }



  if (saveCart(cart)) {

    renderCart();

    checkoutMessage.textContent = "";

  }

}



/* REMOVE ITEM */



function removeItem(productId) {

  const cart = getCart();



  const updated = cart.filter(item => item.id !== productId);



  if (saveCart(updated)) {

    renderCart();

    checkoutMessage.textContent = "";

    showToast("Timepiece removed from your bag.");

  }

}



/* CLEAR CART */



clearCartBtn.addEventListener("click",() => {

  const cart = getCart();



  if (!cart.length) return;



  const confirmed = window.confirm(

    "Remove all timepieces from your shopping bag?"

  );



  if (!confirmed) return;



  if (saveCart([])) {

    renderCart();

    checkoutMessage.textContent = "";

    showToast("Your shopping bag has been cleared.");

  }

});



/* Checkout handled by js/order-checkout.js (premium modal + local demo orders). */

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



/* MOBILE NAV */



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

  if (event.key === "Escape") closeMenu();

});



document.addEventListener("click",event => {

  if (

    navLinks.classList.contains("open") &&

    !navLinks.contains(event.target) &&

    !menuToggle.contains(event.target)

  ) {

    closeMenu();

  }

});



window.addEventListener("resize",() => {

  if (window.innerWidth > 900) closeMenu();

});



/* SCROLL REVEAL */



const revealElements = document.querySelectorAll(".reveal");



if ("IntersectionObserver" in window) {

  const observer = new IntersectionObserver(

    (entries,revealObserver) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          revealObserver.unobserve(entry.target);

        }

      });

    },

    {

      threshold:.1,

      rootMargin:"0px 0px -25px 0px"

    }

  );



  revealElements.forEach(element => {

    observer.observe(element);

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



if (!reduceMotion) {

  const particleCount = window.innerWidth < 650 ? 16 : 38;



  for (let i = 0;i < particleCount;i++) {

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



/* Curated suggestions share the real cart storage; original bottom animation is preserved. */
function renderBagRecommendations() {
  const root = document.getElementById("bagRecommendationGrid");
  if (!root) return;
  const catalog = window.AlbertoProducts || [];
  const selected = new Set(getCart().map(item => item.id));
  const featuredIds = ["AA-015","AA-024","AA-031","AA-040","AA-019","AA-035","AA-027","AA-044"];
  const choices = featuredIds.map(id => catalog.find(item => item.id === id))
    .filter(Boolean).filter(item => !selected.has(item.id)).slice(0,4);
  if (choices.length < 4) {
    for (const product of catalog) {
      if (choices.length >= 4) break;
      if (!selected.has(product.id) && !choices.some(item => item.id === product.id)) choices.push(product);
    }
  }
  root.replaceChildren();
  choices.forEach(product => {
    const card = createElement("article","bag-rec-item");
    const img = createElement("img");
    img.src = product.image;
    img.alt = product.name;
    img.loading = "lazy";
    const inner = createElement("div","bag-rec-info");
    const name = createElement("h3",null,product.name);
    const price = createElement("p",null,formatPrice(product.price));
    const button = createElement("button","bag-rec-add","+ Add to Cart");
    button.type = "button";
    button.addEventListener("click",() => {
      const bag = getCart();
      const existing = bag.find(item => item.id === product.id);
      if (existing && existing.quantity >= MAX_QUANTITY) {
        document.getElementById("bagRecommendationStatus").textContent = "Maximum quantity is 99 per watch.";
        return;
      }
      if (existing) existing.quantity += 1;
      else bag.push({id:product.id,name:product.name,price:product.price,image:product.image,category:product.category,quantity:1});
      if (saveCart(bag)) {
        renderCart();
        document.getElementById("bagRecommendationStatus").textContent = product.name + " added to your bag.";
        if (window.AlbertoCartMotion) window.AlbertoCartMotion.play(button);
      }
    });
    inner.append(name,price,button);
    card.append(img,inner);
    root.appendChild(card);
  });
}

/* INITIAL RENDER */



renderCart();



/* SYNC OTHER TABS */



window.addEventListener("storage",event => {

  if (event.key === CART_KEY) {

    renderCart();

  }

});
