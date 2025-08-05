"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function PlaygroundPage() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const params = useParams();

  const getGroqResponse = async (prompt) => {
    const API_KEY = "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"; // Replace with your actual Groq API key
    const URL = "https://api.groq.com/openai/v1/chat/completions";

    const payload = {
      model: "moonshotai/kimi-k2-instruct", // or llama3-70b-8192 if preferred
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    };

    const fetchWithBackoff = async (retries = 0) => {
      try {
        const response = await fetch(URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(
            `Groq API failed with status ${response.status}: ${
              errorBody.error?.message || "Unknown error"
            }`
          );
        }

        return response.json();
      } catch (err) {
        if (retries < 5) {
          const delay = Math.pow(2, retries) * 1000;
          await new Promise((res) => setTimeout(res, delay));
          return fetchWithBackoff(retries + 1);
        }
        throw err;
      }
    };

    const response = await fetchWithBackoff();
    return response.choices?.[0]?.message?.content || "No response";
  };

  useEffect(() => {
    const pageTitle = params.slug ? params.slug.join(" ") : "Home";

    const htmlPrompt = `
Create a full HTML minimalistic retro landing page with:

- A colorful hero section with a heading and a short paragraph
- A section containing 10 creative and random <a href="..."> links with href attributes pointing to random pages like href="/pizza-slut etc
- At least 2 more sections: one describing imaginary features, and one a fake testimonial
- Simple brilliant and minimalistic CSS for styling and custom animations and gradients.
- No JavaScript
- Return ONLY the raw HTML as a string, no explanation or code block formatting
      `;

    if (htmlPrompt) {
      const fetchOutput = async () => {
        setLoading(true);
        try {
          const result = await getGroqResponse(htmlPrompt);
          const cleaned = result
            .replace(/^```html\s*/, "")
            .replace(/```$/, "")
            .replace(/<think[\s\S]*?<\/think>/gi, "") // removes <think>...</think>
            .trim();

          setOutput(cleaned);
        } catch (error) {
          console.error("Groq fetch failed:", error);
          setOutput(`Error: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };
      fetchOutput();
    } else {
      setOutput("");
    }
  }, [params]);

  return (
    <div className="min-h-screen">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 animate-gradientMove">
          <div className="text-neutral-800 text-5xl font-semibold animate-pulse">
            Loading...
          </div>
        </div>
      )}

      {output && !loading && (
        <div dangerouslySetInnerHTML={{ __html: output }} />
      )}
    </div>
  );
}
