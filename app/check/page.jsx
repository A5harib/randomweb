"use client";
import { useState } from "react";

export default function PlaygroundPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const getGeminiResponse = async (
    conversationHistory = [],
    userMessage = ""
  ) => {
    const API_KEY = "AIzaSyCHA9-xhPVN9EkuOwV2li-Z8wLEC96DkVc";
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const structuredHistory = conversationHistory.map((msg) => ({
      role: msg.type === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    structuredHistory.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: structuredHistory }),
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  };

  const handleSubmit = async () => {
    setLoading(true);
    const result = await getGeminiResponse([], input);
    setOutput(result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100 text-black">
      <h1 className="text-3xl font-bold mb-4">Gemini Playground</h1>

      <textarea
        className="w-full p-3 rounded border border-gray-300 mb-4"
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your prompt here..."
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Get Response"}
      </button>

      {output && (
        <div className="mt-6 p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Response</h2>
          <div dangerouslySetInnerHTML={{ __html: output }} />
        </div>
      )}
    </div>
  );
}
