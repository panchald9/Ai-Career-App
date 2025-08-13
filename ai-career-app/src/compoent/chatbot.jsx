import React, { useState, useRef, useEffect } from "react";
import "./ChatBox.css";

export default function ChatBox() {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    try {
      if (!message.trim() && !file) {
        alert("Please enter a question or upload a file.");
        return;
      }

      const newMessage = { role: "user", content: message || file?.name };
      setChatHistory((prev) => [...prev, newMessage]);
      setMessage("");
      setFile(null);

      setLoading(true);

      const formData = new FormData();
      formData.append("question", message);
      if (file) formData.append("file", file);

      const res = await fetch("http://127.0.0.1:5000/generate_milestone", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      const botMessage = {
        role: "bot",
        content: data.answer || data.message || `Error: ${data.error || "Unknown error"}`,
      };

      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setChatHistory((prev) => [...prev, { role: "bot", content: "An error occurred." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className="chatbox-wrapper">
      <div className="chatbox-messages">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="chatbox-input-area">
        <textarea
          rows="2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your question..."
        />
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
