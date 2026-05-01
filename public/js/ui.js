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
      <div class="menu-card">

        <!-- FULL IMAGE -->
        <img 
          src="${p.image_url || '/no-image.png'}" 
          alt="${p.name}"
          class="menu-card-img"
        />

        <!-- CONTENT -->
        <div class="menu-card-body">
          <h4 class="menu-title">${p.name}</h4>
          <p class="menu-desc">${p.description || ''}</p>

          <div class="menu-bottom">
            <strong class="menu-price">K${p.price}</strong>
            <button class="add-btn">Add</button>
          </div>
        </div>

      </div>
    `;

    div.querySelector('.add-btn').onclick = () => {
      addToCart(p);
      updateCartUI();
    };

    list.appendChild(div);
  });
};

// 🔹 Update totals (SAFE VERSION)
export const updateCartUI = () => {
  const total = getTotal();

  const totalTop = document.getElementById('cartTotal');       // may not exist
  const totalModal = document.getElementById('cartTotalModal');

  if (totalTop) {
    totalTop.innerText = 'K' + total.toFixed(2);
  }

  if (totalModal) {
    totalModal.innerText = total.toFixed(2); // no "K" because HTML already has it
  }

  renderCartItems();
};

// 🔹 Render cart items
export const renderCartItems = () => {
  const container = document.getElementById('cartItems');
  const cart = getCart();

  if (!container) return;

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