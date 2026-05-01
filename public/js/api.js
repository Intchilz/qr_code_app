const BASE_URL = 'https://qr-code-app-utap.onrender.com/api/v1';

// 🔹 Generic helper (clean + reusable)
const request = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }

  return res.json();
};

// 🔹 MENU
export const getMenu = (restaurantId) => {
  return request(`${BASE_URL}/menu?restaurantId=${restaurantId}`);
};

// 🔹 ORDERS
export const createOrder = (data) => {
  return request(`${BASE_URL}/orders`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// 🔹 SESSION
export const initSession = (data) => {
  return request(`${BASE_URL}/session/init`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};