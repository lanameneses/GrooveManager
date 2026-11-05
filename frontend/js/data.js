// DADOS TEMPORÁRIOS DO PROTÓTIPO.
// Este ficheiro será retirado gradualmente quando o frontend usar a API.

const initialProducts = [
  {
    id: 1,
    title: "Thriller",
    artist: "Michael Jackson",
    category: "Pop",
    condition: "New",
    price: 32.99,
    stock: 5,
    coverClass: "cover-1"
  },
  {
    id: 2,
    title: "The Dark Side of the Moon",
    artist: "Pink Floyd",
    category: "Rock",
    condition: "Used",
    price: 24.99,
    stock: 2,
    coverClass: "cover-2"
  },
  {
    id: 3,
    title: "Kind of Blue",
    artist: "Miles Davis",
    category: "Jazz & Blues",
    condition: "New",
    price: 27.99,
    stock: 4,
    coverClass: "cover-3"
  },
  {
    id: 4,
    title: "Like a Virgin",
    artist: "Madonna",
    category: "Pop",
    condition: "Used",
    price: 22.99,
    stock: 1,
    coverClass: "cover-4"
  },
  {
    id: 5,
    title: "Abbey Road",
    artist: "The Beatles",
    category: "Rock",
    condition: "New",
    price: 29.99,
    stock: 3,
    coverClass: "cover-5"
  },
  {
    id: 6,
    title: "Live at the Regal",
    artist: "B.B. King",
    category: "Jazz & Blues",
    condition: "Used",
    price: 23.99,
    stock: 2,
    coverClass: "cover-6"
  },
  {
    id: 7,
    title: "Viagens",
    artist: "Pedro Abrunhosa",
    category: "Música Portuguesa",
    condition: "New",
    price: 22.99,
    stock: 6,
    coverClass: "cover-7"
  },
  {
    id: 8,
    title: "What's Going On",
    artist: "Marvin Gaye",
    category: "Soul / Funk / Disco",
    condition: "New",
    price: 25.99,
    stock: 4,
    coverClass: "cover-8"
  }
];

function getProducts() {
  const saved = sessionStorage.getItem("grooveProducts");
  return saved ? JSON.parse(saved) : [...initialProducts];
}

function saveProducts(products) {
  sessionStorage.setItem("grooveProducts", JSON.stringify(products));
}


// Temporary cart. The assignment allows the cart to remain temporary.
function getCart() {
  return JSON.parse(localStorage.getItem("grooveCart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("grooveCart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach(el => el.textContent = total);
}

function money(value) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

document.addEventListener("DOMContentLoaded", updateCartCount);
