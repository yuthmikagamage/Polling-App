import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const socket = useRef(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [votes, setVotes] = useState({
    HTML: 0,
    Java: 0,
    Python: 0,
    jQuery: 0,
  });
  const [totalVotes, setTotalVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (socket.current) {
      return;
    }

    socket.current = new WebSocket("ws://localhost:3001");
    socket.current.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "history") {
        setVotes(data.votes);
        setTotalVotes(data.totalVotes);
      } else if (data.type === "update") {
        setVotes(data.votes);
        setTotalVotes(data.totalVotes);
      }
    });
  }, []);

  const handleVote = (option) => {
    if (hasVoted) return;

    setSelectedOption(option);
    setHasVoted(true);

    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(
        JSON.stringify({
          type: "vote",
          option: option,
        })
      );
    }
  };

  const getPercentage = (option) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes[option] / totalVotes) * 100);
  };

  return (
    <div className="pollingApp">
      <div className="container">
        <h1 className="title">Favorite Language</h1>
        <div className="options">
          {Object.keys(votes).map((option) => (
            <div
              key={option}
              className={`option ${
                selectedOption === option ? "selected" : ""
              } ${hasVoted ? "voted" : ""}`}
              onClick={() => handleVote(option)}
            >
              <div className="option-content">
                <div className="option-left">
                  <div
                    className={`radio ${
                      selectedOption === option ? "radio-selected" : ""
                    }`}
                  >
                    {selectedOption === option && (
                      <div className="radio-inner"></div>
                    )}
                  </div>
                  <span className="option-text">{option}</span>
                </div>
                {hasVoted && (
                  <span className="percentage">{getPercentage(option)}%</span>
                )}
              </div>
              {hasVoted && (
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${getPercentage(option)}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
