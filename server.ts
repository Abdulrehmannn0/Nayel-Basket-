/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables from .env if present
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization helper for Gemini SDK to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables. Set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Ensure the server can log status gracefully
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

/**
 * Endpoint: /api/gemini/chat
 * Acts as the premium OmniShop AI Assistant.
 * Receives the current conversational context + user query and responds using gemini-3.5-flash.
 */
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { history, message, productsCatalog } = req.body;
    const ai = getGeminiClient();

    const catalogStr = JSON.stringify(productsCatalog || []);

    const systemInstruction = `You are "Nayel Basket AI Concierge", the ultimate, ultra-elite luxury home decor concierge, styling advisor, and interior designer. 
Your goal is to assist customers, recommend specific products from the catalog, answer dimension spacing queries, explain return timelines, or create interior decor coordinates.

Rules:
1. Use standard markdown for formatting. Make your responses highly visual, bulleted, and structured with elegant headers.
2. If the user asks for product suggestions, actively query and reference items from this specific product catalog:
${catalogStr}
Always cite the exact product names, prices, and IDs.
3. Keep your tone elite, knowledgeable, warm, and professional—reminiscent of a world-class interior designer.
4. Try to guide them toward adding items to their cart. Provide creative stying suggestions (e.g., pairing a hand-burnished brass candle holder with natural solid oak tables).
5. Address shipping, returns (30-day return policy, instant wallet refund), and rewards (earn 10 reward points per $1 spent).`;

    const chatHistory = (history || []).map((h: any) => ({
      role: h.sender === "user" ? "user" : "model",
      parts: [{ text: h.text }],
    }));

    // Generate response using gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...chatHistory,
        { text: message }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with AI Shopping Assistant." });
  }
});

/**
 * Endpoint: /api/gemini/summarize
 * Generates an instant, highly comprehensive review summary.
 */
app.post("/api/gemini/summarize", async (req, res) => {
  try {
    const { productName, reviews } = req.body;
    const ai = getGeminiClient();

    if (!reviews || reviews.length === 0) {
      return res.json({ text: "No reviews available yet to summarize. Be the first to purchase and review this product!" });
    }

    const reviewsText = reviews.map((r: any) => `User ${r.userName} (${r.rating}/5 stars): "${r.comment}"`).join("\n\n");

    const prompt = `You are an AI Review Summarizer. Please analyze the following customer reviews for "${productName}" and generate an elegant, structured summary.

Reviews:
${reviewsText}

Format your output exactly as follows (using standard markdown):
### 📊 Consensus Rating
[Provide a 1-sentence description of how customers generally feel about this product]

### ✨ Key Strengths
* [Point 1]
* [Point 2]

### ⚠️ Common Criticisms & Considerations
* [Point 1 (or state 'None reported' if all reviews are extremely positive)]

### 📏 Fit & Sizing Recommendation
[Provide sizing advice based on reviews, e.g., 'Fits true to size', 'Runs slightly large, order a size down']`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Summarize Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate review summary." });
  }
});

/**
 * Endpoint: /api/gemini/outfit
 * Uses generative AI to design customized interior lookbooks from our catalog.
 */
app.post("/api/gemini/outfit", async (req, res) => {
  try {
    const { occasion, productsCatalog } = req.body;
    const ai = getGeminiClient();

    const catalogStr = JSON.stringify(productsCatalog || []);

    const prompt = `You are an elite interior styling expert. A client wants a curated home decor lookbook suggestion for this room/theme: "${occasion}".
Review the product catalog below and select 2 to 3 coordinating items that match the aesthetic.

Catalog:
${catalogStr}

Return a beautiful styled design lookbook in JSON format matching this schema:
{
  "lookbookTitle": "Cozy Scandinavian Sanctuary" (example),
  "stylistNotes": "A curated blending of warm solid oak timber and soft organic candle warmth." (example),
  "items": [
    { "productId": "prod_1", "name": "Solid European White Oak Coffee Table", "stylingRole": "Central anchoring piece" }
  ],
  "accessorizingTips": "Add hand-woven wool rugs and soft linen draperies." (example)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lookbookTitle: { type: Type.STRING },
            stylistNotes: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  name: { type: Type.STRING },
                  stylingRole: { type: Type.STRING }
                },
                required: ["productId", "name", "stylingRole"]
              }
            },
            accessorizingTips: { type: Type.STRING }
          },
          required: ["lookbookTitle", "stylistNotes", "items", "accessorizingTips"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Gemini Outfit Error:", error);
    res.status(500).json({ error: error.message || "Stylist is temporarily offline." });
  }
});

/**
 * Endpoint: /api/gemini/size-recommendation
 * Predicts perfect scale for home decor pieces based on space measurements.
 */
app.post("/api/gemini/size-recommendation", async (req, res) => {
  try {
    const { height, weight, fitPreference, sizes } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are a professional interior space layout planner. Compute the optimal size scaling of products for a client with these room dimensions:
- Ceiling Height: ${height}
- Room Area: ${weight}
- Layout preference: ${fitPreference} (e.g., minimalist, cozy, statement-making)
Available Scales: ${JSON.stringify(sizes || ["Compact / Accent Piece", "Mid-Scale Curation", "Grand Centerpiece Scale", "Multi-Piece Set"])}

Return your spatial analysis and scale recommendation in JSON format matching this schema:
{
  "recommendedSize": "Mid-Scale Curation",
  "confidenceScore": 95,
  "fitJustification": "With ceilings at ${height} and an area of ${weight}, mid-scale decor avoids crowding the vertical field while maintaining a warm, centered focal presence, matching your ${fitPreference} preference."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedSize: { type: Type.STRING },
            confidenceScore: { type: Type.INTEGER },
            fitJustification: { type: Type.STRING }
          },
          required: ["recommendedSize", "confidenceScore", "fitJustification"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Gemini Sizing Error:", error);
    res.status(500).json({ error: error.message || "Tailor is temporarily offline." });
  }
});

// Setup Vite Dev Middleware or Serve Production Build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted for development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled production assets from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise eCommerce Server running successfully at http://0.0.0.0:${PORT}`);
  });
}

startServer();
