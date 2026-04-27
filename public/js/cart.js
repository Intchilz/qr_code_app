let cart = [];

export const addToCart = (product) => {
  const existing = cart.find(i => i.id === product.id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
};

export const increaseQty = (id) => {
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
};

export const decreaseQty = (id) => {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty--;

  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
};

export const removeItem = (id) => {
  cart = cart.filter(i => i.id !== id);
};

export const getCart = () => cart;

export const getTotal = () =>
  cart.reduce((sum, i) => sum + i.price * i.qty, 0);

export const clearCart = () => {
  cart = [];
};