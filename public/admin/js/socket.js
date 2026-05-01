let socket;

// 🔌 Initialize socket
export const initSocket = (restaurantId) => {
  const BASE = window.location.origin; // 🔥 dynamic

  socket = io(BASE);

  socket.on('connect', () => {
    console.log('🟢 Socket connected:', socket.id);

    if (restaurantId) {
      socket.emit('join_restaurant', restaurantId);
    }
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
  });

  return socket;
};

// 🔁 Getter
export const getSocket = () => socket;

// 🔔 Events
export const onOrderCreated = (callback) => {
  socket?.on('ORDER_CREATED', callback);
};

export const onOrderUpdated = (callback) => {
  socket?.on('ORDER_UPDATED', callback);
};