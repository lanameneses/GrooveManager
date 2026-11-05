let cart = getCart();
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

function renderCart() {
  updateCartCount();

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-message">O teu carrinho está vazio.</p>';
    cartTotal.textContent = money(0);
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-row">
      <div>
        <strong>${item.title}</strong>
        <p class="muted">${item.artist}</p>
      </div>

      <div class="qty-controls">
        <button type="button" aria-label="Diminuir quantidade"
          onclick="changeQuantity(${item.id}, -1)">−</button>
        <span>${item.quantity}</span>
        <button type="button" aria-label="Aumentar quantidade"
          onclick="changeQuantity(${item.id}, 1)">+</button>
      </div>

      <strong>${money(item.price * item.quantity)}</strong>

      <button class="remove-btn" type="button"
        onclick="removeFromCart(${item.id})">Remover</button>
    </div>
  `).join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = money(total);
}

function changeQuantity(id, change) {
  const item = cart.find(product => product.id === id);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) cart = cart.filter(product => product.id !== id);

  saveCart(cart);
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(product => product.id !== id);
  saveCart(cart);
  renderCart();
}

document.getElementById("clearCart").addEventListener("click", () => {
  cart = [];
  saveCart(cart);
  renderCart();
});

renderCart();
