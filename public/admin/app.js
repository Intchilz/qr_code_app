import { initSocket } from './socket.js';

const ordersEl = document.getElementById('orders');
const notificationsEl = document.getElementById('notifications');

const counts = {
  pending: 0,
  cooking: 0,
  total: 0
};

const updateStats = () => {
  document.getElementById('pendingCount').innerText = counts.pending;
  document.getElementById('cookingCount').innerText = counts.cooking;
  document.getElementById('totalCount').innerText = counts.total;
};

// 🔹 Render order
const renderOrder = (order) => {
  const el = document.createElement('div');
  el.className = 'order-item';

  el.innerHTML = `
    Table ${order.table_id} - ${order.status}
  `;

  ordersEl.prepend(el);
};

// 🔹 Notifications
const addNotification = (text) => {
  const li = document.createElement('li');
  li.innerText = text;
  notificationsEl.prepend(li);
};

// 🔹 SOCKET EVENTS
initSocket(

  // ORDER CREATED
  (order) => {
    counts.pending++;
    counts.total++;
    updateStats();

    renderOrder(order);
    addNotification(`New Order: Table ${order.table_id}`);
  },

  // ORDER UPDATED
  (data) => {
    if (data.status === 'COOKING') {
      counts.pending--;
      counts.cooking++;
    }

    updateStats();
    addNotification(`Order ${data.orderId} → ${data.status}`);
  }

);