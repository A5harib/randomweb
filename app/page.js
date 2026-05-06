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

    const htmlPrompt = `
Return only a complete, valid HTML page with inline CSS. 
INSTRUCTIONAL PRIORITY: You MUST generate high-quality, realistic professional copy. No "Lorem Ipsum." Every heading and paragraph must feel like a real production-grade SaaS landing page for a cutting-edge tech startup.

### THE DESIGN SEED (Select ONE randomly and execute):
1. THE ENTERPRISE (Swiss/Minimal): High whitespace, #000 text, 900-weight "Inter" or "Lexend" fonts. Uses a 12-column grid. Borders are 1px #eee.
2. THE DISRUPTOR (Hard Brutalist): #000 4px borders, hard 8px shadows (box-shadow: 8px 8px 0px #000). Use "Cyber Lime" or "Safety Orange" for buttons.
3. THE STUDIO (Magazine Luxury): Serif headers ('Fraunces' or 'Playfair Display'), asymmetrical layouts, image masks, and vertical running text.
4. THE NEON LAB (Y2K/Cyber): Dark mode (#050505), 1px dotted borders, CSS-drawn "grain" overlay, and monospace 'Space Mono' typography.

### MANDATORY CONTENT COMPONENTS:
- STICKY NAV: A blur-glass (backdrop-filter) navigation bar with a "Get Started" button.
- HERO SECTION: A "CSS-Built Dashboard Mockup" with a realistic UI (sidebar, charts, data-grids).
- SOCIAL PROOF: A "Trusted by" section with 5 diverse abstract logos and real company names.
- FEATURE GRID: Use 'display: grid' with 'grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))'. Each feature must have a unique, descriptive name and a 2-sentence explanation of its technical value.
- PRICING TABLE: A 3-tier card layout (Startup, Pro, Enterprise) with specific feature lists and monthly prices.
- FOOTER: A 4-column footer with realistic links (Resources, Company, Legal, Social).
- 10 LINKS: Exactly 10 creative <a href="/..."> links with unique slugs related to the SaaS niche.

### THE "ANTI-SLOP" ENGINE:
- NO SOFT GRADIENTS: Use solid colors or 'conic-gradient' for sharp, technical-looking transitions.
- NO CENTER-CENTER DEFAULTS: Elements must use diverse alignment (text-align: left, right, or justified). 
- TYPOGRAPHY HIERARCHY: Use 'clamp()' for responsive font sizes. Headers must be 4x larger than body text.
- NOISE & TEXTURE: Use an SVG <filter> for a grainy texture overlay on the entire body.
- NO JAVASCRIPT: Use the 'checkbox hack' (<input type="checkbox"> + <label>) for a mobile menu or a light/dark mode toggle.

### TECHNICAL SPECS:
- Use Google Fonts via @import.
- Use CSS Variables (--primary, --bg, --accent) for all colors.
- Images: Use https://picsum.photos/seed/{RANDOM_SEED}/1200/800 for varied, high-quality visuals. Ensure each image has a different seed.
- Output: Raw HTML string only. No code blocks. No markdown. No chatter.
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
