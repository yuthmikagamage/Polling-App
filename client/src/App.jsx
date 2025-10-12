import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const socket = useRef(null);
  const [polls, setPolls] = useState([
    {
      id: "default",
      title: "Favorite Language",
      options: ["HTML", "Java", "Python", "jQuery"],
      votes: { HTML: 0, Java: 0, Python: 0, jQuery: 0 },
      totalVotes: 0,
      hasVoted: false,
      selectedOption: null,
    },
  ]);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollOptions, setNewPollOptions] = useState(["", ""]);

  useEffect(() => {
    if (socket.current) {
      return;
    }

    socket.current = new WebSocket("ws://localhost:3001");

    socket.current.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "allPolls") {
        setPolls(data.polls);
      } else if (data.type === "update") {
        setPolls((prevPolls) =>
          prevPolls.map((poll) =>
            poll.id === data.pollId
              ? { ...poll, votes: data.votes, totalVotes: data.totalVotes }
              : poll
          )
        );
      } else if (data.type === "pollCreated") {
        setPolls(data.polls);
        setShowCreatePoll(false);
        setNewPollTitle("");
        setNewPollOptions(["", ""]);
      }
    });
  }, []);

  const handleVote = (pollId, option) => {
    const poll = polls.find((p) => p.id === pollId);
    if (poll.hasVoted) return;

    setPolls((prevPolls) =>
      prevPolls.map((p) =>
        p.id === pollId ? { ...p, hasVoted: true, selectedOption: option } : p
      )
    );

    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(
        JSON.stringify({
          type: "vote",
          option: option,
          pollId: pollId,
        })
      );
    }
  };

  const getPercentage = (poll, option) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((poll.votes[option] / poll.totalVotes) * 100);
  };

  const handleAddOption = () => {
    setNewPollOptions([...newPollOptions, ""]);
  };

  const handleRemoveOption = (index) => {
    if (newPollOptions.length > 2) {
      const updated = newPollOptions.filter((_, i) => i !== index);
      setNewPollOptions(updated);
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...newPollOptions];
    updated[index] = value;
    setNewPollOptions(updated);
  };

  const handleCreatePoll = () => {
    const validOptions = newPollOptions.filter((opt) => opt.trim() !== "");

    if (newPollTitle.trim() === "" || validOptions.length < 2) {
      alert("Please enter a poll title and at least 2 options");
      return;
    }

    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(
        JSON.stringify({
          type: "createPoll",
          title: newPollTitle,
          options: validOptions,
        })
      );
    }
  };

  return (
    <div className="pollingApp">
      <div className="polls-container">
        <div className="header-section">
          <button
            className="create-poll-btn"
            onClick={() => setShowCreatePoll(!showCreatePoll)}
          >
            {showCreatePoll ? "Cancel" : "+ New Poll"}
          </button>
        </div>

        {showCreatePoll && (
          <div className="container create-poll-container">
            <h2 className="create-title">Create New Poll</h2>
            <div className="create-poll-form">
              <input
                type="text"
                className="poll-title-input"
                placeholder="Enter poll title..."
                value={newPollTitle}
                onChange={(e) => setNewPollTitle(e.target.value)}
              />

              <div className="poll-options-list">
                {newPollOptions.map((option, index) => (
                  <div key={index} className="option-input-group">
                    <input
                      type="text"
                      className="option-input"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                    />
                    {newPollOptions.length > 2 && (
                      <button
                        className="remove-option-btn"
                        onClick={() => handleRemoveOption(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button className="add-option-btn" onClick={handleAddOption}>
                + Add Option
              </button>

              <button className="submit-poll-btn" onClick={handleCreatePoll}>
                Create Poll
              </button>
            </div>
          </div>
        )}

        {polls.map((poll) => (
          <div key={poll.id} className="container">
            <h1 className="title">{poll.title}</h1>
            <div className="options">
              {poll.options.map((option) => (
                <div
                  key={option}
                  className={`option ${
                    poll.selectedOption === option ? "selected" : ""
                  } ${poll.hasVoted ? "voted" : ""}`}
                  onClick={() => handleVote(poll.id, option)}
                >
                  <div className="option-content">
                    <div className="option-left">
                      <div
                        className={`radio ${
                          poll.selectedOption === option ? "radio-selected" : ""
                        }`}
                      >
                        {poll.selectedOption === option && (
                          <div className="radio-inner"></div>
                        )}
                      </div>
                      <span className="option-text">{option}</span>
                    </div>
                    {poll.hasVoted && (
                      <span className="percentage">
                        {getPercentage(poll, option)}%
                      </span>
                    )}
                  </div>
                  {poll.hasVoted && (
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${getPercentage(poll, option)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
