const ws = require("ws");
const server = new ws.Server({ port: 3001 });

console.log("Server Connected! Port - 3001");

const votes = {
  HTML: 0,
  Java: 0,
  Python: 0,
  jQuery: 0,
};

let totalVotes = 0;

server.on("connection", (client) => {
  console.log("Client Connected");

  client.send(
    JSON.stringify({
      type: "history",
      votes: votes,
      totalVotes: totalVotes,
    })
  );

  client.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "vote") {
      votes[data.option]++;
      totalVotes++;

      const updateMessage = JSON.stringify({
        type: "update",
        votes: votes,
        totalVotes: totalVotes,
      });

      server.clients.forEach((client) => {
        client.send(updateMessage);
      });
    }
  });
});
