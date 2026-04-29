const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/admin/login.html';
}

const parseJwt = (t) => JSON.parse(atob(t.split('.')[1]));
const user = parseJwt(token);

const RESTAURANT_ID = user.restaurant_id;

// 🔐 helper
const authFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
};

// =======================
// LOAD MENU (SAFE)
// =======================
const loadMenu = async () => {
  try {
    const res = await fetch(`/api/v1/menu?restaurantId=${RESTAURANT_ID}`);
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error('Menu API error:', data);
      return;
    }

    const container = document.getElementById('menuList');
    container.innerHTML = '';

    data.forEach(cat => {
      const div = document.createElement('div');

      div.innerHTML = `
        <h4>${cat.name}</h4>
        <ul>
          ${cat.products.map(p => `
            <li style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
              
              <img 
                src="${p.image_url || '/no-image.png'}" 
                width="50" 
                height="50"
                style="object-fit:cover; border-radius:6px;"
              />

              <div style="flex:1;">
                <strong>${p.name}</strong><br/>
                <small>K${p.price}</small>
              </div>

              <button onclick="deleteProduct(${p.id})">X</button>

            </li>
          `).join('')}
        </ul>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error('LOAD MENU FAILED:', err);
  }
};

// =======================
// LOAD CATEGORIES (SAFE)
// =======================
const loadCategories = async () => {
  try {
    const res = await fetch(`/api/v1/menu/categories?restaurantId=${RESTAURANT_ID}`);
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error('Categories API error:', data);
      return;
    }

    const select = document.getElementById('categorySelect');
    select.innerHTML = '';

    data.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.innerText = cat.name;
      select.appendChild(opt);
    });

  } catch (err) {
    console.error('LOAD CATEGORIES FAILED:', err);
  }
};

// =======================
// ADD CATEGORY
// =======================
document.getElementById('addCategoryBtn').onclick = async () => {
  const name = document.getElementById('categoryName').value;

  const res = await authFetch('/api/v1/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  if (!res.ok) {
    console.error('CATEGORY ERROR:', await res.json());
    return;
  }

  loadCategories();
  loadMenu();
};

// =======================
// ADD PRODUCT (WITH IMAGE)
// =======================
document.getElementById('addProductBtn').onclick = async () => {
  const formData = new FormData();

  formData.append('name', document.getElementById('productName').value);
  formData.append('price', document.getElementById('productPrice').value);
  formData.append('description', document.getElementById('productDesc').value);
  formData.append('category_id', document.getElementById('categorySelect').value);

  const file = document.getElementById('productImage').files[0];
  if (file) formData.append('image', file);

  const res = await fetch('/api/v1/products', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('PRODUCT CREATE ERROR:', err);
    alert(err.message || 'Failed to create product');
    return;
  }

  loadMenu();
};

// =======================
// DELETE PRODUCT
// =======================
window.deleteProduct = async (id) => {
  const res = await authFetch(`/api/v1/products/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    console.error('DELETE ERROR:', await res.json());
    return;
  }

  loadMenu();
};

// INIT
loadCategories();
loadMenu();