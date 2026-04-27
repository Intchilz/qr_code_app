import { getMenu, createOrder, initSession } from './api.js';
import { renderCategories, updateCartUI, renderCartItems } from './ui.js';
import { getCart, clearCart } from './cart.js';
import { initSocket, getSocket } from './socket.js';

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

// 🔹 track current order
let currentOrderId = null;

// 🔹 init socket
initSocket();
const socket = getSocket();

// 🔹 order status UI
const statusEl = document.getElementById('orderStatus');

const showStatus = (text) => {
  statusEl.innerText = text;
  statusEl.classList.remove('hidden');
};

// 🔹 SOCKET EVENTS
socket.on('ORDER_UPDATED', (data) => {
  if (data.orderId !== currentOrderId) return;

  showStatus(`Order Status: ${data.status}`);

  if (data.status === 'READY') {
    alert('Your order is ready!');
  }

  if (data.status === 'SERVED') {
    showStatus('Order completed');
  }
});

socket.on('ORDER_CANCELLED', (data) => {
  if (data.orderId !== currentOrderId) return;

  showStatus('Order cancelled');
});

// 🔹 Modal controls
const modal = document.getElementById('cartModal');
const openBtn = document.getElementById('viewCartBtn');

openBtn.onclick = () => {
  modal.classList.remove('hidden');
  renderCartItems();
};

// Close on background click
modal.onclick = (e) => {
  if (e.target.id === 'cartModal') {
    modal.classList.add('hidden');
  }
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
    console.error(err);
    alert('Order failed');
  }
};

initApp();