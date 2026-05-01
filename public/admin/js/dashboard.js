// 🔐 TOKEN
const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/admin/login.html';
}

// 🔓 Decode token
const parseJwt = (t) => JSON.parse(atob(t.split('.')[1]));
const user = parseJwt(token);

const RESTAURANT_ID = user.restaurant_id;

// 🔌 Socket
import { socket } from './socket.js';

// 🔊 Sounds
const newOrderSound = new Audio('/sounds/new-order.mp3');
const delaySound = new Audio('/sounds/delay.mp3');

// unlock audio
document.body.addEventListener('click', () => {
  newOrderSound.play().then(() => newOrderSound.pause());
}, { once: true });

// 🔐 Join correct room
socket.emit('join_restaurant', RESTAURANT_ID);

// 🔐 Auth fetch helper
const authFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
};

// 🔹 Delay rules
const DELAY_RULES = {
  PENDING: 2 * 60 * 1000,
  IN_PREPARATION: 5 * 60 * 1000,
  COOKING: 10 * 60 * 1000
};

// 🔹 Container
const ordersList = document.getElementById('ordersList');

// =======================
// 🟢 NEW ORDER
// =======================
socket.on('ORDER_CREATED', (order) => {
  newOrderSound.play();

  const div = document.createElement('div');
  div.className = 'order-card pending';
  div.id = `order-${order.id}`;

  div.dataset.createdAt = Date.now();
  div.dataset.status = 'PENDING';

  div.innerHTML = `
    <strong>Table ${order.table_id}</strong>
    <span>PENDING</span>

    <div class="actions">
      <button onclick="updateStatus(${order.id}, 'IN_PREPARATION')">Start</button>
      <button onclick="updateStatus(${order.id}, 'COOKING')">Cook</button>
      <button onclick="updateStatus(${order.id}, 'READY')">Ready</button>
      <button onclick="updateStatus(${order.id}, 'SERVED')">Serve</button>
    </div>
  `;

  ordersList.prepend(div);
});

// =======================
// 🟡 STATUS UPDATE
// =======================
socket.on('ORDER_UPDATED', ({ orderId, status }) => {
  const el = document.getElementById(`order-${orderId}`);
  if (!el) return;

  el.dataset.status = status;
  el.querySelector('span').innerText = status;
  el.classList.remove('delayed');
});

// =======================
// 🔴 ADMIN ACTION
// =======================
window.updateStatus = async (orderId, status) => {
  try {
    await authFetch(`/api/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  } catch (err) {
    console.error(err);
    alert('Update failed');
  }
};

// =======================
// 🔴 DELAY DETECTION
// =======================
setInterval(() => {
  const orders = document.querySelectorAll('.order-card');

  orders.forEach(el => {
    const status = el.dataset.status;
    const createdAt = Number(el.dataset.createdAt);

    if (!DELAY_RULES[status]) return;

    const elapsed = Date.now() - createdAt;

    if (elapsed > DELAY_RULES[status]) {
      if (!el.classList.contains('delayed')) {
        el.classList.add('delayed');
        delaySound.play();

        el.querySelector('span').innerText =
          status + ' (DELAYED)';
      }
    }
  });
}, 10000);

// =======================
// 🔗 NAVIGATION (ADDED)
// =======================
window.goToMenu = () => {
  window.location.href = '/admin/menu.html';
};

window.goToQR = () => {
  window.location.href = '/admin/qr.html';
};

// ===== BRANDING UPDATE =====
document.getElementById('saveBranding').onclick = async () => {
  const token = localStorage.getItem('token');

  const formData = new FormData();

  const file = document.getElementById('logoInput').files[0];
  const color = document.getElementById('colorInput').value;

  if (file) formData.append('logo', file);
  formData.append('primary_color', color);

  await fetch('/api/v1/restaurants/branding', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  alert('Branding updated');
};