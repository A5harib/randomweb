"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function PlaygroundPage() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const params = useParams();
  //pexels cFLNu1JfV65hEA9FSHCDRjHQsNwu8vutAXzP7gSqb2gM4qM0yN2rcaip
  // This function calls the Gemini API to get an HTML response.
  const getGeminiResponse = async (prompt) => {
    const API_KEY = "AIzaSyDewKJJHkgK01OJt5XOLd9zwac9D63tAkU";
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    // The key change is specifying the responseMimeType in generationConfig.
    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const fetchWithBackoff = async (retries = 0) => {
      try {
        const response = await fetch(URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          // Log the full response and its body for debugging a 4xx or 5xx error
          console.error("API Error Response:", response);
          const errorBody = await response.json();
          console.error("API Error Body:", errorBody);

          if (response.status === 429 && retries < 5) {
            const delay = Math.pow(2, retries) * 1000;
            await new Promise((res) => setTimeout(res, delay));
            return fetchWithBackoff(retries + 1);
          }
          // Throw a more informative error message
          throw new Error(
            `API request failed with status: ${response.status}. Details: ${errorBody.error.message}`
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
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  };

  useEffect(() => {
    const pageTitle = params.slug ? params.slug.join(" ") : "Home";
    // const htmlPrompt = `Return only the minimal HTML content meant to go inside <body> for a page titled "${pageTitle}".
    //     Use inline Tailwind CSS classes with "className" instead of "class".
    //     Don't Include functional JavaScript, and do not include <html>, <head>, or <body> tags.
    //     Return only the HTML, no explanations.`;
    const htmlPrompt = `
Return only a complete, valid HTML page with inline CSS styles. The page should be titled "${pageTitle}" and must follow these rules:

1. Generate a colorful and elegant layout tailored to the page purpose. Generate multiple sections as needed. Structure everything cleanly with smooth flow and vibrant visuals.
2. Use open images from https://picsum.photos or similar services.
3. All links must be clickable and open in new tabs (use target="_blank") and include something in the href of every link like /${pageTitle}/"something related".
4. Include at least 5 interactive elements (e.g., button with JS alert, or collapsible section).
5. Ensure the layout looks good on both mobile and desktop (use responsive design with flex/grid).
6. Use modern, eye-catching fonts (via inline style or Google Fonts).
7. Do NOT include explanations—only raw, standalone HTML.
8. Ensure everything works independently in a browser—no external CSS or JS files except images/fonts.
9. Include minimal, inline JavaScript to add interactivity (e.g., toggle buttons, alert on click, scroll effects, etc.), no script tags.
10.Simple brilliant and crazy CSS for unreal styling and alot of custom animations and gradients.



`;


    if (htmlPrompt) {
      const fetchOutput = async () => {
        setLoading(true);
        try {
          const result = await getGeminiResponse(htmlPrompt);

          // Clean the code block
          const cleaned = result
            .replace(/^```html\s*/, "")
            .replace(/```$/, "")
            .replace(/<script.*?tailwindcss\.com.*?<\/script>/, "") // 💥 Remove tailwind CDN script

            .trim();

          setOutput(cleaned);
        } catch (error) {
          console.error("Failed to fetch response:", error);
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
    <div className="min-h-screen   ">
      {/* <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold mb-2">
          Current Prompt from Path:
        </h2>
        <p className="p-3 bg-gray-700 rounded text-gray-200 break-words">
          {params.slug
            ? params.slug.join("/")
            : "No prompt provided. Please use a path like '/your/query/here'."}
        </p>
      </div> */}

      {loading && (
        <div className="flex justify-center items-center mt-6">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-4 text-blue-300">Generating...</span>
        </div>
      )}

      {output && !loading && (
        <div className="">
          <div dangerouslySetInnerHTML={{ __html: output }} />
        </div>
      )}
    </div>
  );
}
