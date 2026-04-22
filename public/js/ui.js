import { addToCart, getCart, getTotal, updateQty } from './cart.js';

// 🔹 Categories
export const renderCategories = (categories) => {
  const el = document.getElementById('categories');
  el.innerHTML = '';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.innerText = cat.name;
    btn.onclick = () => renderMenu(cat.products);
    el.appendChild(btn);
  });

  if (categories.length) renderMenu(categories[0].products);
};

// 🔹 Menu
export const renderMenu = (products) => {
  const list = document.getElementById('menuList');
  list.innerHTML = '';

  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'menu-item';

    div.innerHTML = `
      <h4>${p.name}</h4>
      <p>${p.description}</p>
      <strong>K${p.price}</strong>
      <button>Add</button>
    `;

    div.querySelector('button').onclick = () => {
      addToCart(p);
      updateCartUI();
    };

    list.appendChild(div);
  });
};

// 🔹 Cart UI (UPDATED)
export const updateCartUI = () => {
  const cart = getCart();

  document.getElementById('cartCount').innerText = cart.length;

  document.getElementById('cartTotalModal').innerText =
    getTotal().toFixed(2);

  renderCartItems();
};

// 🔹 Render cart items
export const renderCartItems = () => {
  const container = document.getElementById('cartItems');
  const cart = getCart();

  container.innerHTML = '';

  cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';

    el.innerHTML = `
      <div>
        <strong>${item.name}</strong><br/>
        K${item.price}
      </div>

      <div>
        <button onclick="window.dec(${item.id})">-</button>
        ${item.qty}
        <button onclick="window.inc(${item.id})">+</button>
      </div>
    `;

    container.appendChild(el);
  });
};

// 🔹 expose qty controls
window.inc = (id) => {
  updateQty(id, 1);
  updateCartUI();
};

window.dec = (id) => {
  updateQty(id, -1);
  updateCartUI();
};