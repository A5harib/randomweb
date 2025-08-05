// components/Chat.jsx

"use client"
import React, { useState } from "react";
import axios from "axios";
export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile", // or "llama3-70b-8192"
          messages: newMessages,
        },
        {
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
          },
        }
      );

      const reply = res.data.choices[0].message;
      setMessages([...newMessages, reply]);
    } catch (err) {
      console.error("Groq error:", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <div className="space-y-2 h-96 overflow-y-auto border p-2 rounded">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded ${
              msg.role === "user" ? "bg-blue-100" : "bg-green-100"
            }`}
          >
            <strong>{msg.role === "user" ? "You" : "Groq"}:</strong>{" "}
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <input
          className="border flex-1 px-3 py-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
