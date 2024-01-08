// 在 web worker 中创建一个 WebSocket 客户端
const socket = new WebSocket("wss://example.com");

// 处理 WebSocket 连接事件
socket.onopen = function () {
  console.log("WebSocket 连接已建立");
};

socket.onmessage = function (event) {
  const data = event.data;
  handleReceivedData(data);
};

socket.onclose = function () {
  console.log("WebSocket 连接已关闭");
};

socket.onerror = function (error) {
  console.error("WebSocket 错误:", error);
};

// 处理接收到的数据
function handleReceivedData(data) {
  // 在这里添加你的数据处理逻辑
  console.log("处理数据:", data);
}
