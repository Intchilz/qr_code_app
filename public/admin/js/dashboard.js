const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/admin/login.html';
}

// 🔌 Socket
import { socket } from './socket.js';

// 🔊 Sounds
const newOrderSound = new Audio('/sounds/new-order.mp3');
const delaySound = new Audio('/sounds/delay.mp3');

// unlock audio (required by browsers)
document.body.addEventListener('click', () => {
  newOrderSound.play().then(() => newOrderSound.pause());
}, { once: true });

// 🔹 Join restaurant room (IMPORTANT)
const RESTAURANT_ID = 1; // replace dynamically later
socket.emit('join_restaurant', RESTAURANT_ID);

// 🔹 Delay rules (ms)
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

  // remove delay state if recovered
  el.classList.remove('delayed');
});

// =======================
// 🔴 DELAY DETECTION LOOP
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

        // 🔊 play once
        delaySound.play();

        el.querySelector('span').innerText =
          status + ' (DELAYED)';
      }
    }
  });
}, 10000);