let products = [];
let categories = [];

const productForm = document.getElementById("productForm");
const productId = document.getElementById("productId");
const categoryId = document.getElementById("categoryId");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const stockFilter = document.getElementById("stockFilter");
const productTableBody = document.getElementById("productTableBody");
const formTitle = document.getElementById("formTitle");
const formMessage = document.getElementById("formMessage");
const stockStatus = document.getElementById("stockStatus");
const submitButton = document.getElementById("submitButton");
const cancelEdit = document.getElementById("cancelEdit");

function money(value) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);

  if (response.status === 401) {
    window.location.href = "/index.html";
    throw new Error("A sessão terminou.");
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.erro || "Não foi possível concluir a operação.");
  }

  return data;
}

async function loadSession() {
  const session = await apiRequest("/api/session");
  document.getElementById("welcomeMessage").textContent =
    `Sessão iniciada por ${session.user.name}.`;
}

async function loadCategories() {
  categories = await apiRequest("/api/categories");

  categoryId.replaceChildren();
  categoryFilter.innerHTML = '<option value="All">Todas</option>';

  for (const category of categories) {
    const formOption = document.createElement("option");
    formOption.value = category.id;
    formOption.textContent = category.name;
    categoryId.appendChild(formOption);

    const filterOption = document.createElement("option");
    filterOption.value = category.name;
    filterOption.textContent = category.name;
    categoryFilter.appendChild(filterOption);
  }
}

async function loadProducts(message = "") {
  stockStatus.textContent = "A carregar...";
  products = await apiRequest("/api/products");
  renderPage();
  stockStatus.textContent = message || `${products.length} produto(s).`;
}

function updateSummary() {
  const totalUnits = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = products.filter(product => product.stock > 0 && product.stock <= 2).length;
  const outOfStock = products.filter(product => product.stock === 0).length;

  document.getElementById("totalProducts").textContent = products.length;
  document.getElementById("totalUnits").textContent = totalUnits;
  document.getElementById("lowStock").textContent = lowStock;
  document.getElementById("outOfStock").textContent = outOfStock;
}

function getFilteredProducts() {
  const search = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const selectedStock = stockFilter.value;

  return products.filter(product => {
    const matchesSearch =
      product.title.toLowerCase().includes(search) ||
      product.artist.toLowerCase().includes(search);

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    let matchesStock = true;
    if (selectedStock === "Available") matchesStock = product.stock > 0;
    if (selectedStock === "Low") matchesStock = product.stock > 0 && product.stock <= 2;
    if (selectedStock === "Empty") matchesStock = product.stock === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });
}

function addCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  row.appendChild(cell);
}

function createButton(text, className, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  button.addEventListener("click", action);
  return button;
}

function renderTable() {
  const filtered = getFilteredProducts();
  productTableBody.replaceChildren();

  if (filtered.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 7;
    cell.textContent = "Não existem produtos para apresentar.";

    row.appendChild(cell);
    productTableBody.appendChild(row);
    return;
}

  for (const product of filtered) {
    const row = document.createElement("tr");

    const coverCell = document.createElement("td");
    const coverImage = document.createElement("img");

    coverImage.src = product.imageUrl;
    coverImage.alt = `Capa de ${product.title}`;
    coverImage.className = "stock-cover";

    coverImage.addEventListener("error", () => {
      coverImage.remove();
      coverCell.textContent = "Sem imagem";
    });

    coverCell.appendChild(coverImage);
    row.appendChild(coverCell);

    addCell(row, `${product.title} — ${product.artist}`);
    addCell(row, product.category);
    addCell(row, money(product.price));
    addCell(row, product.stock);

    const stockActions = document.createElement("td");
    stockActions.className = "stock-actions";
    stockActions.append(
      createButton("−", "stock-button", () => changeStock(product, -1)),
      createButton("+", "stock-button", () => changeStock(product, 1))
    );
    row.appendChild(stockActions);

    const actions = document.createElement("td");
    actions.append(
      createButton("Editar", "table-action", () => startEdit(product)),
      createButton("Eliminar", "table-action delete-action", () => deleteProduct(product))
    );
    row.appendChild(actions);

    productTableBody.appendChild(row);
  }
}

function renderPage() {
  updateSummary();
  renderTable();
}

async function changeStock(product, change) {
  const newStock = product.stock + change;

  if (newStock < 0) {
    stockStatus.textContent = "O stock não pode ser negativo.";
    return;
  }

  const updatedProduct = {
    categoryId: product.categoryId,
    title: product.title,
    artist: product.artist,
    condition: product.condition,
    price: product.price,
    stock: newStock,
    coverClass: product.coverClass,
    imageUrl: product.imageUrl
  };

  try {
    await apiRequest(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct)
    });

    await loadProducts("Stock atualizado com sucesso.");
  } catch (error) {
    stockStatus.textContent = error.message;
  }
}

function startEdit(product) {
  productId.value = product.id;
  document.getElementById("title").value = product.title;
  document.getElementById("artist").value = product.artist;
  categoryId.value = product.categoryId;
  document.getElementById("condition").value = product.condition;
  document.getElementById("price").value = product.price;
  document.getElementById("stock").value = product.stock;
  document.getElementById("imageUrl").value = product.imageUrl;

  formTitle.textContent = "Editar produto";
  submitButton.textContent = "Guardar alterações";
  cancelEdit.hidden = false;
  formMessage.textContent = "Altere os campos necessários.";
  productForm.scrollIntoView({ behavior: "smooth" });
}

function resetForm() {
  productForm.reset();
  productId.value = "";
  formTitle.textContent = "Adicionar produto";
  submitButton.textContent = "Guardar produto";
  cancelEdit.hidden = true;
}

async function deleteProduct(product) {
  const confirmed = window.confirm(
    `Eliminar definitivamente o produto "${product.title}"?`
  );

  if (!confirmed) return;

  try {
    await apiRequest(`/api/products/${product.id}`, { method: "DELETE" });
    await loadProducts("Produto eliminado com sucesso.");
  } catch (error) {
    stockStatus.textContent = error.message;
  }
}

productForm.addEventListener("submit", async event => {
  event.preventDefault();

  const id = productId.value;
  const product = {
    categoryId: Number(categoryId.value),
    title: document.getElementById("title").value.trim(),
    artist: document.getElementById("artist").value.trim(),
    condition: document.getElementById("condition").value,
    price: Number(document.getElementById("price").value),
    stock: Number(document.getElementById("stock").value),
    coverClass: "cover-1",
    imageUrl: document.getElementById("imageUrl").value.trim()
  };

  submitButton.disabled = true;
  formMessage.textContent = "A guardar...";

  try {
    await apiRequest(id ? `/api/products/${id}` : "/api/products", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    });

    resetForm();
    formMessage.textContent = id
      ? "Produto atualizado com sucesso."
      : "Produto adicionado com sucesso.";
    await loadProducts();
  } catch (error) {
    formMessage.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

cancelEdit.addEventListener("click", () => {
  resetForm();
  formMessage.textContent = "Edição cancelada.";
});

searchInput.addEventListener("input", renderTable);
categoryFilter.addEventListener("change", renderTable);
stockFilter.addEventListener("change", renderTable);

document.getElementById("logoutButton").addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/index.html";
});

async function startPage() {
  try {
    await loadSession();
    await loadCategories();
    await loadProducts();
  } catch (error) {
    stockStatus.textContent = error.message;
  }
}

startPage();
