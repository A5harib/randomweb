"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function PlaygroundPage() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const params = useParams();

  const getGroqResponse = async (prompt) => {
    const API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    const URL = process.env.NEXT_PUBLIC_GROQ_API_URL;

    const payload = {
      model: process.env.NEXT_PUBLIC_GROQ_MODEL, // or llama3-70b-8192 if preferred
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
            }`,
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

    const htmlPrompt = `Return only a complete, valid HTML page with inline CSS. 
TITLE: "${pageTitle}"

INSTRUCTIONAL PRIORITY: You MUST generate high-quality, realistic professional copy specifically tailored to the topic "${pageTitle}". No "Lorem Ipsum." Every heading and paragraph must feel like it was written by a subject matter expert.

### STEP 1: THE STYLE DICE ROLL
Randomly select ONE specific design logic and ignore the others:
1. SWISS TYPEFACE: White/Black/Red. Massive "Display" fonts. 12-column grid. No borders.
2. HARD-BRUTALISM: #000 4px borders. High-saturation "Cyber-Lime" or "Safety Orange." 0px border-radius.
3. MAGAZINE: Serif fonts (e.g., 'Playfair Display'). Asymmetrical image overlaps. Vertical text elements.
4. Y2K/CHAOS: Grainy textures, marquee tags, 1px dotted borders, system-UI icons.
5. NEO-MINIMALISM: Charcoal #111 vs Bone #F5F5F7. Deep shadows.

### STEP 2: MANDATORY CONTENT COMPONENTS
- A "Gravity-Defying" Hero: Use 'clip-path' or 'transform: skewY' for a non-rectilinear header.
- The Matrix-Link Section: Exactly 10 creative <a> links related to "${pageTitle}". Use: href="/${pageTitle}/[contextual-slug]".
- Deep Content Sections: At least 3 detailed sections with specific information, data points, or "expert advice" about "${pageTitle}".
- Interactive Prototype: Use <details> for menus and <input type="checkbox"> hacks for "dark mode" or "modals."
- Inline Logic: Use 'onclick' or 'onmouseenter' for direct DOM manipulation. NO <script> TAGS.

### STEP 3: CSS ARCHITECTURE (ANTI-SLOP DECREE)
- NO SOFT GRADIENTS: Use 'repeating-conic-gradient', 'steps()' in animations, or solid color blocks.
- GRID SABOTAGE: Avoid 'justify-content: center'. Use 'grid-template-columns: repeat(12, 1fr)' and force elements to span random ranges (e.g., 'grid-column: 2 / 8').
- NOISE & TEXTURE: Apply a CSS 'contrast(150%) brightness(1000%)' filter on a low-opacity grain overlay.
- TYPOGRAPHY: Pair a Google Font with a weight of 900 (Display) with a Monospace font for body text.

### STEP 4: TECHNICAL CONSTRAINTS
- Responsive: Use 'clamp()' for font sizes and 'minmax' for grid columns.
- Images: Use https://picsum.photos/seed/{RANDOM_SEED}/800/600 for topic-relevant visuals. Ensure each image has a unique seed.
- Output: Raw HTML string only. No markdown code blocks. No explanations.
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
          console.log(cleaned);
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
