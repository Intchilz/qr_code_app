const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/admin/login.html';
}

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

// =======================
// LOAD TABLES
// =======================
const loadTables = async () => {
  const res = await authFetch('/api/v1/tables');
  const tables = await res.json();

  const container = document.getElementById('tableList');
  container.innerHTML = '';

  tables.forEach(t => {
    const div = document.createElement('div');

    div.innerHTML = `
      <h4>${t.name}</h4>
      <button onclick="generateQR('${t.id}')">Generate QR</button>
      <div id="qr-${t.id}"></div>
    `;

    container.appendChild(div);
  });
};

// =======================
// ADD TABLE
// =======================
document.getElementById('addTableBtn').onclick = async () => {
  const name = document.getElementById('tableName').value;

  await authFetch('/api/v1/tables', {
    method: 'POST',
    body: JSON.stringify({ name })
  });

  loadTables();
};

// =======================
// GENERATE QR
// =======================
window.generateQR = async (tableId) => {
  const res = await authFetch(`/api/v1/tables/${tableId}/qr`);
  const data = await res.json();

  const el = document.getElementById(`qr-${tableId}`);

  el.innerHTML = `
    <img src="${data.qr}" width="150" />
    <br/>
    <small>${data.url}</small>
  `;
};

// INIT
loadTables();