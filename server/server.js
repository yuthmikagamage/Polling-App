const ws = require("ws");
const server = new ws.Server({ port: 3001 });

console.log("Server Connected! Port - 3001");

const polls = [
  {
    id: "default",
    title: "Favorite Language",
    options: ["HTML", "Java", "Python", "jQuery"],
    votes: {
      HTML: 0,
      Java: 0,
      Python: 0,
      jQuery: 0,
    },
    totalVotes: 0,
    hasVoted: false,
    selectedOption: null,
  },
];

let pollCounter = 0;

server.on("connection", (client) => {
  console.log("Client Connected");

  // Send all polls to newly connected client
  client.send(
    JSON.stringify({
      type: "allPolls",
      polls: polls,
    })
  );

  client.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "vote") {
      const poll = polls.find((p) => p.id === data.pollId);

      if (poll) {
        poll.votes[data.option]++;
        poll.totalVotes++;

        // Broadcast update to all clients
        const updateMessage = JSON.stringify({
          type: "update",
          pollId: data.pollId,
          votes: poll.votes,
          totalVotes: poll.totalVotes,
        });

        server.clients.forEach((c) => {
          if (c.readyState === ws.OPEN) {
            c.send(updateMessage);
          }
        });
      }
    } else if (data.type === "createPoll") {
      pollCounter++;
      const newPollId = `poll_${pollCounter}_${Date.now()}`;

      const newVotes = {};
      data.options.forEach((option) => {
        newVotes[option] = 0;
      });

      const newPoll = {
        id: newPollId,
        title: data.title,
        options: data.options,
        votes: newVotes,
        totalVotes: 0,
        hasVoted: false,
        selectedOption: null,
      };

      polls.push(newPoll);

      // Broadcast new poll list to all clients
      const pollsListMessage = JSON.stringify({
        type: "pollCreated",
        polls: polls,
      });

      server.clients.forEach((c) => {
        if (c.readyState === ws.OPEN) {
          c.send(pollsListMessage);
        }
      });

      console.log(`New poll created: ${data.title}`);
    }
  });

  client.on("close", () => {
    console.log("Client Disconnected");
  });
});
