export const socket = io('http://localhost:5000');

export const initSocket = () => {
  socket.on('ORDER_UPDATED', data => {
    document.getElementById('orderStatus').innerText =
      `Order ${data.orderId}: ${data.status}`;
  });
};