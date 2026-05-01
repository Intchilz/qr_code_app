import { getMenu, createOrder, initSession } from './api.js';
import { renderCategories, updateCartUI, renderCartItems } from './ui.js';
import { getCart, clearCart } from './cart.js';
import { initSocket, getSocket } from './socket.js';

document.addEventListener('DOMContentLoaded', () => {

  // 🔹 QR params
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    alert('Invalid QR Code');
    return;
  }

  // 🔹 session + context
  let sessionId = null;
  let tableId = null;
  let restaurantId = null;

  // 🔹 track current order
  let currentOrderId = null;

  // 🔹 init socket
  initSocket();
  const socket = getSocket();

  // 🔹 UI elements
  const statusEl = document.getElementById('orderStatus');
  const modal = document.getElementById('cartModal');
  const openBtn = document.getElementById('openCart');
  const submitBtn = document.getElementById('submitOrder');

  if (!openBtn || !modal || !submitBtn) {
    console.error('❌ Critical UI elements missing');
    return;
  }

  const showStatus = (text) => {
    statusEl.innerText = text;
    statusEl.classList.remove('hidden');
  };

  // =======================
  // 🔌 SOCKET EVENTS
  // =======================
  socket.on('ORDER_UPDATED', (data) => {
    if (data.orderId !== currentOrderId) return;

    showStatus(`Order Status: ${data.status}`);

    if (data.status === 'READY') alert('Your order is ready!');
    if (data.status === 'SERVED') showStatus('Order completed');
  });

  socket.on('ORDER_CANCELLED', (data) => {
    if (data.orderId !== currentOrderId) return;
    showStatus('Order cancelled');
  });

  // =======================
  // 🛒 MODAL
  // =======================
  openBtn.onclick = () => {
    modal.classList.remove('hidden');
    renderCartItems();
  };

  modal.onclick = (e) => {
    if (e.target.id === 'cartModal') {
      modal.classList.add('hidden');
    }
  };

  // =======================
  // 🍽️ LOAD MENU
  // =======================
  const loadMenu = async () => {
    if (!restaurantId) {
      console.error('❌ restaurantId is missing');
      return;
    }

    try {
      const data = await getMenu(restaurantId);

      console.log('📦 MENU DATA:', data);

      if (!Array.isArray(data)) {
        console.error('❌ Invalid menu response:', data);
        return;
      }

      if (!data.length) {
        document.getElementById('menuList').innerHTML =
          '<p style="padding:10px;">No menu items available</p>';
        return;
      }

      renderCategories(data);

    } catch (err) {
      console.error('❌ Menu load failed:', err);
    }
  };

  // =======================
  // 🔐 INIT SESSION
  // =======================
  const initApp = async () => {
    try {
      const session = await initSession({ token });

      console.log('🟢 SESSION:', session);

      sessionId = session.id;
      tableId = session.table_id;
      restaurantId = session.restaurant_id;

      if (!restaurantId) {
        console.error('❌ restaurant_id missing from session');
        return alert('Invalid session data');
      }

      // 🔥 BRANDING (STACKED HEADER)
      const header = document.querySelector('.header');

      if (header) {
        header.innerHTML = '';

        if (session.logo_url) {
          const logo = document.createElement('img');
          logo.src = session.logo_url;
          logo.className = 'restaurant-logo';
          header.appendChild(logo);
        }

        const nameEl = document.createElement('h2');
        nameEl.innerText = session.restaurant_name || 'Restaurant';
        header.appendChild(nameEl);

        const tableEl = document.createElement('span');
        tableEl.innerText = session.table_name || tableId;
        header.appendChild(tableEl);
      }

      // 🎨 APPLY THEME
      if (session.theme_config?.primary_color) {
        document.documentElement.style.setProperty(
          '--primary-color',
          session.theme_config.primary_color
        );
      }

      await loadMenu();

    } catch (err) {
      console.error('❌ Session init failed:', err);
      alert('Failed to start session');
    }
  };

  // =======================
  // 🧾 SUBMIT ORDER
  // =======================
  submitBtn.onclick = async () => {
    if (!sessionId) return alert('Session not ready');

    const cart = getCart();
    if (!cart.length) return alert('Cart is empty');

    const order = {
      table_id: tableId,
      session_id: sessionId,
      items: cart.map(i => ({
        product_id: i.id,
        quantity: i.qty
      })),
      idempotency_key: Date.now().toString()
    };

    try {
      const res = await createOrder(order);

      currentOrderId = res.id;
      showStatus('Order Status: PENDING');

      clearCart();
      updateCartUI();
      modal.classList.add('hidden');

    } catch (err) {
      console.error('❌ Order failed:', err);
      alert('Order failed');
    }
  };

  // 🚀 START
  initApp();

});