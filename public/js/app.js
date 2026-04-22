import { getMenu, createOrder, initSession } from './api.js';
import { renderCategories, updateCartUI } from './ui.js';
import { getCart, clearCart } from './cart.js';
import { initSocket } from './socket.js';

// 🔹 QR params
const params = new URLSearchParams(window.location.search);

const tableId = params.get('table_id');
const restaurantId = params.get('restaurant_id');
const token = params.get('token');

if (!tableId || !restaurantId || !token) {
  alert('Invalid QR Code');
}

// 🔹 session
let sessionId = null;

initSocket();

// 🔹 Modal controls
const modal = document.getElementById('cartModal');

document.getElementById('openCart').onclick = () => {
  modal.classList.remove('hidden');
  updateCartUI();
};

document.getElementById('closeCart').onclick = () => {
  modal.classList.add('hidden');
};

// 🔹 Load menu
const loadMenu = async () => {
  const data = await getMenu(restaurantId);
  renderCategories(data);
};

// 🔹 Init session
const initApp = async () => {
  try {
    const session = await initSession({
      table_id: tableId,
      restaurant_id: restaurantId
    });

    sessionId = session.id;

    document.getElementById('tableNumber').innerText = `Table ${tableId}`;

    await loadMenu();

  } catch (err) {
    console.error(err);
    alert('Failed to start session');
  }
};

// 🔹 Submit order
document.getElementById('submitOrder').onclick = async () => {
  if (!sessionId) return alert('Session not ready');

  const order = {
    table_id: tableId,
    session_id: sessionId,
    items: getCart().map(i => ({
      product_id: i.id,
      quantity: i.qty
    })),
    idempotency_key: Date.now().toString()
  };

  try {
    const res = await createOrder(order);

    alert(`Order #${res.id} placed`);

    clearCart();
    updateCartUI();
    modal.classList.add('hidden');

  } catch (err) {
    console.error(err);
    alert('Order failed');
  }
};

initApp();