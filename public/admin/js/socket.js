const socket = io('http://localhost:5000');

// 🔹 Initialize socket + join restaurant room
export const initSocket = (restaurantId) => {
  socket.emit('join_restaurant', restaurantId);
};

// 🔹 Listen helpers (clean separation)
export const onOrderCreated = (callback) => {
  socket.on('ORDER_CREATED', callback);
};

export const onOrderUpdated = (callback) => {
  socket.on('ORDER_UPDATED', callback);
};

export { socket };