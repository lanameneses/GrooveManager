// Os produtos serão recebidos do backend e da base de dados MySQL.
let products = [];
let selectedState = "All";

const catalogCategories = [
  "Rock",
  "Pop",
  "Jazz & Blues",
  "Música Portuguesa",
  "Soul / Funk / Disco"
];

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const catalogStatus = document.getElementById("catalogStatus");
const filterButtons = document.querySelectorAll(".filter-btn");
const categoryButtons = document.querySelectorAll(".category-card");
const stateLinks = document.querySelectorAll("[data-state-link]");

function getFilteredProducts() {
  const search = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  return products.filter(product => {
    const matchesSearch =
      product.title.toLowerCase().includes(search) ||
      product.artist.toLowerCase().includes(search);

    const matchesCategory = category === "All" || product.category === category;
    const matchesState = selectedState === "All" || product.condition === selectedState;

    return matchesSearch && matchesCategory && matchesState;
  });
}

function renderProducts() {
  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    productGrid.innerHTML = "";
    catalogStatus.textContent = "Nenhum disco corresponde à sua pesquisa.";
    return;
  }

  catalogStatus.textContent = `${filtered.length} disco(s) encontrado(s).`;

  productGrid.innerHTML = catalogCategories.map(category => {
    const categoryProducts = filtered.filter(product => product.category === category);
    if (categoryProducts.length === 0) return "";
    const categoryId = category.replace(/[^a-z0-9]/gi, "-");

    return `
      <section class="catalog-category" aria-labelledby="category-${categoryId}">
        <div class="catalog-category-heading">
          <p class="kicker">GÉNERO MUSICAL</p>
          <h2 id="category-${categoryId}">${category}</h2>
          <span>${categoryProducts.length} disco(s)</span>
        </div>
        <div class="product-grid">
          ${categoryProducts.map(product => `
            <article class="product-card">
              <div class="cover ${product.imageUrl ? "album-cover" : product.coverClass}">
                ${
                  product.imageUrl
                    ? `<img src="${product.imageUrl}" alt="Capa de ${product.title}">`
                    : `<span>${product.title}</span>`
                 }
                 <span class="condition-tag">
                    ${product.condition === "New" ? "Novo" : "Usado"}
                  </span>
                </div>
              <h3>${product.title}</h3>
              <p class="artist">${product.artist}</p>
              <p class="category">${product.category}</p>
              <div class="product-bottom">
                <div class="price">${money(product.price)}</div>
                <button class="icon-btn" type="button"
                  aria-label="Adicionar ${product.title} ao carrinho"
                  onclick="addToCart(${product.id})">+</button>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function setStateFilter(state) {
  selectedState = state;
  filterButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.state === state);
  });
  renderProducts();
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => setStateFilter(button.dataset.state));
});

stateLinks.forEach(link => {
  link.addEventListener("click", () => setStateFilter(link.dataset.stateLink));
});

categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    categoryFilter.value = button.dataset.category;
    renderProducts();
    document.getElementById("catalog").scrollIntoView();
  });
});

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);

function addToCart(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(item => item.id === id);

  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });

  saveCart(cart);
}

async function loadProducts() {
  catalogStatus.textContent = "A carregar os discos...";

  try {
    const response = await fetch("/api/products");

    if (!response.ok) {
      throw new Error("Não foi possível carregar os produtos.");
    }

    products = await response.json();
    renderProducts();
  } catch (error) {
    productGrid.innerHTML = "";
    catalogStatus.textContent =
      "Não foi possível ligar ao catálogo. Confirme se o backend e o MySQL estão ligados.";
  }
}

loadProducts();
