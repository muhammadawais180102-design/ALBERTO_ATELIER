"use strict";



/*

  ALBERTO ATELIER PRODUCT CATALOG



  Demo product details from js/product-catalog.js.

  Images must exist inside the project's images folder.

  Currency: Pakistani Rupees (PKR).



  Shared cart storage key for the upcoming cart.html:

  alberto_atelier_cart_v1



  Each cart item:

  { id, name, price, image, category, quantity }

*/



const PRODUCTS = window.AlbertoProducts || [];

const CART_KEY = "alberto_atelier_cart_v1";

const productGrid = document.getElementById("productGrid");

const resultCount = document.getElementById("resultCount");

const priceFilter = document.getElementById("priceFilter");

const cartAnnouncement = document.getElementById("cartAnnouncement");



let activeCategory = "all";

let activeSort = "default";
let visibleProductCount = 12;
const PRODUCTS_PER_PAGE = 12;





const currencyFormatter = new Intl.NumberFormat("en-PK", {

  style:"currency",

  currency:"PKR",

  maximumFractionDigits:0

});



function formatPrice(value) {

  return currencyFormatter.format(value);

}



function getCart() {

  try {

    const saved = JSON.parse(localStorage.getItem(CART_KEY));



    if (!Array.isArray(saved)) {

      return [];

    }



    return saved.filter(item =>

      item &&

      typeof item.id === "string" &&

      Number.isFinite(Number(item.quantity)) &&

      Number(item.quantity) > 0

    );

  } catch (error) {

    console.warn("Unable to read cart:",error);

    return [];

  }

}



function saveCart(cart) {

  try {

    localStorage.setItem(CART_KEY,JSON.stringify(cart));

    return true;

  } catch (error) {

    console.error("Unable to save cart:",error);

    return false;

  }

}



function updateCartCount() {

  const cart = getCart();



  const count = cart.reduce((total,item) => {

    return total + Number(item.quantity);

  },0);



  const countBadge = document.getElementById("cartCount");

  countBadge.textContent = count > 99 ? "99+" : count;

  countBadge.classList.toggle("show",count > 0);

}



function announceCart(message) {
  // Accessible message; visual success is handled by the new box/trolley animation.
  cartAnnouncement.textContent = "";
  window.requestAnimationFrame(() => {
    cartAnnouncement.textContent = message;
  });
}



function addToCart(productId) {

  const product = PRODUCTS.find(item => item.id === productId);



  if (!product) return;



  const cart = getCart();

  const existing = cart.find(item => item.id === productId);



  if (existing) {

    if (Number(existing.quantity) >= 99) {
      announceCart("Maximum quantity is 99 per watch.");
      return false;
    }
    existing.quantity = Math.min(99, Number(existing.quantity) + 1);

  } else {

    cart.push({

      id:product.id,

      name:product.name,

      price:product.price,

      image:product.image,

      category:product.category,

      quantity:1

    });

  }



  if (saveCart(cart)) {

    updateCartCount();

    announceCart(product.name + " added to your cart.");

    return true;

  } else {

    announceCart("Cart could not be saved. Check browser storage.");
    window.alert("Cart could not be saved. Check browser storage.");

    return false;

  }

}



function createProductCard(product) {

  const article = document.createElement("article");

  article.className = "product-card";



  const imageWrap = document.createElement("div");

  imageWrap.className = "product-image-wrap";



  const image = document.createElement("img");

  image.className = "product-image";

  image.src = product.image;

  image.alt = product.name + " luxury watch";

  image.loading = "lazy";



  const tag = document.createElement("span");

  tag.className = "product-tag";

  tag.textContent = product.tag;



  imageWrap.append(image,tag);



  const info = document.createElement("div");

  info.className = "product-info";



  const category = document.createElement("span");

  category.className = "product-category";

  category.textContent = product.categoryLabel;



  const title = document.createElement("h3");

  title.className = "product-name";

  title.textContent = product.name;



  const description = document.createElement("p");

  description.className = "product-description";

  description.textContent = product.description;



  const bottom = document.createElement("div");

  bottom.className = "product-bottom";



  const price = document.createElement("span");

  price.className = "product-price";

  price.textContent = formatPrice(product.price);



  const button = document.createElement("button");

  button.type = "button";

  button.className = "add-cart-btn";



  const icon = document.createElement("i");

  icon.className = "bi bi-bag-plus";



  const buttonText = document.createElement("span");

  buttonText.textContent = "Add to Cart";



  button.append(icon,buttonText);



  button.addEventListener("click",() => {

    // Keep the original cart functionality and button appearance.
    const saved = addToCart(product.id);

    // Start only the box + trolley sequence after a successful save.
    if (saved && window.AlbertoCartMotion) {
      window.AlbertoCartMotion.play(button);
    }

  });



  bottom.append(price,button);

  info.append(category,title,description,bottom);

  article.append(imageWrap,info);



  return article;

}



function renderProducts() {

  let filtered = PRODUCTS.filter(product => {

    return activeCategory === "all" ||

      product.category === activeCategory;

  });



  filtered = [...filtered];



  if (activeSort === "low") {

    filtered.sort((a,b) => a.price - b.price);

  } else if (activeSort === "high") {

    filtered.sort((a,b) => b.price - a.price);

  } else if (activeSort === "name") {

    filtered.sort((a,b) => a.name.localeCompare(b.name));

  }



  productGrid.replaceChildren();

  const visible = filtered.slice(0,visibleProductCount);
  resultCount.textContent = `SHOWING ${visible.length} OF ${filtered.length} TIMEPIECES`;
  document.getElementById("catalogMoreWrap").hidden = visible.length >= filtered.length;

  if (filtered.length === 0) {

    const empty = document.createElement("p");

    empty.className = "no-results";

    empty.textContent = "No timepieces found in this collection.";

    productGrid.appendChild(empty);

    return;

  }



  const fragment = document.createDocumentFragment();



  visible.forEach(product => {

    fragment.appendChild(createProductCard(product));

  });



  productGrid.appendChild(fragment);

}



/* CATEGORY FILTERS */



document.querySelectorAll(".filter-btn").forEach(button => {

  button.addEventListener("click",() => {

    activeCategory = button.dataset.filter;
    visibleProductCount = PRODUCTS_PER_PAGE;



    document.querySelectorAll(".filter-btn").forEach(item => {

      const selected = item === button;

      item.classList.toggle("active",selected);

      item.setAttribute("aria-pressed",String(selected));

    });



    renderProducts();

  });

});



/* SORTING */



priceFilter.addEventListener("change",() => {

  activeSort = priceFilter.value;
  visibleProductCount = PRODUCTS_PER_PAGE;

  renderProducts();

});



document.getElementById("loadMoreProducts").addEventListener("click",() => {
  visibleProductCount += PRODUCTS_PER_PAGE;
  renderProducts();
});

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



/* COPYRIGHT */



document.getElementById("currentYear").textContent =

  new Date().getFullYear();



/* INITIALIZE */



renderProducts();

updateCartCount();



window.addEventListener("storage",event => {

  if (event.key === CART_KEY) {

    updateCartCount();

  }

});
