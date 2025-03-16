import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000");

function App() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [username] = useState(`User${Math.floor(Math.random() * 1000)}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.on("message", (message) => {
      if (message.sender !== username) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off("message");
    };
  }, [username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e?.preventDefault();
    if (messageInput.trim() !== "") {
      const newMessage = {
        text: messageInput,
        sender: username,
        timestamp: new Date().toISOString(),
      };
      socket.emit("message", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessageInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="App">
      <h1>React Chat App</h1>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.sender === username ? "sent" : "received"
            }`}
          >
            <div className="message-content">{message.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-container" onSubmit={sendMessage}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={messageInput.trim() === ""}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
