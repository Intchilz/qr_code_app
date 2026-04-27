let socket;

export const initSocket = () => {
  socket = io('http://localhost:5000');
  return socket;
};

export const getSocket = () => socket;