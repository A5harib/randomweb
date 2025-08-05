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
Return only a complete, valid HTML page with inline CSS styles. The page should be titled "${pageTitle}" and must follow these rules:

1. Generate a colorful and elegant layout tailored to the page purpose. Generate multiple sections as needed based on "${pageTitle}". Structure everything cleanly with smooth flow and vibrant visuals.
2. Use open images from https://picsum.photos or similar services.
3. All links must be clickable and open in new tabs (use target="_blank") and include something in the href of every link like /${pageTitle}/"something related".
4. Only use inline JS. Use onclick, oninput, etc. No external scripts. Only use features that work with dangerouslySetInnerHTML. Avoid script tags. Use clever HTML/CSS for interaction (e.g., <details>, <input type="checkbox">, etc.). Make it look like a functional UI prototype.
5. Ensure the layout looks good on both mobile and desktop (use responsive design with flex/grid).
6. Use modern, eye-catching fonts (via inline style or Google Fonts).
7. Do NOT include explanations—only raw, standalone HTML.
8. Ensure everything works independently in a browser—no external CSS or JS files except images/fonts.
9. Include minimal, inline JavaScript to add interactivity (e.g., toggle buttons, alert on click, scroll effects, etc.), no script tags.
10. Brilliant and crazy CSS for unreal styling and alot of custom animations and gradients.
11.it should be a complete page with long multiple sections
12. have paragraphs, headings, lists, and images

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
