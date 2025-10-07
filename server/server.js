const ws = require("ws");
const server = new ws.Server({ port: 3001 });
console.log("Server Connected! Port - 3001");
const history = [[]];

server.on("connection", (client) => {
  console.log("Client Connected");
  client.send(JSON.stringify({ type: "history", history: history }));
});
