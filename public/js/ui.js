import {
  addToCart,
  getCart,
  getTotal,
  increaseQty,
  decreaseQty,
  removeItem
} from './cart.js';

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

// 🔹 Update totals (TOP BAR + MODAL)
export const updateCartUI = () => {
  const total = getTotal();

  document.getElementById('cartTotal').innerText =
    'K' + total.toFixed(2);

  document.getElementById('cartTotalModal').innerText =
    'K' + total.toFixed(2);

  renderCartItems();
};

// 🔹 Render cart items (NO window hacks)
export const renderCartItems = () => {
  const container = document.getElementById('cartItems');
  const cart = getCart();

  container.innerHTML = '';

  if (!cart.length) {
    container.innerHTML = '<p>Cart is empty</p>';
    return;
  }

  cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';

    el.innerHTML = `
      <div>
        <strong>${item.name}</strong><br/>
        K${item.price} x ${item.qty}
      </div>

      <div>
        <button class="dec">-</button>
        <button class="inc">+</button>
        <button class="remove">x</button>
      </div>
    `;

    // Attach events safely
    el.querySelector('.inc').onclick = () => {
      increaseQty(item.id);
      updateCartUI();
    };

    el.querySelector('.dec').onclick = () => {
      decreaseQty(item.id);
      updateCartUI();
    };

    el.querySelector('.remove').onclick = () => {
      removeItem(item.id);
      updateCartUI();
    };

    container.appendChild(el);
  });
};