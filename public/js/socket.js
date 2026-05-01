let socket;

export const initSocket = () => {
  const BASE = window.location.origin; // 🔥 dynamic host
  socket = io(BASE);
  return socket;
};

export const getSocket = () => socket;