import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import axios from "axios";
import { zodToJsonSchema } from "zod-to-json-schema";
import { VariantsSchema } from "./src/types.ts";

const REMOTION_API_BASE = process.env.NEXT_PUBLIC_RENDER_API || "http://34.225.138.109:3005";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", async (req, res) => {
    try {
      const response = await axios.get(`${REMOTION_API_BASE}/health`, { timeout: 5000 });
      res.json(response.data);
    } catch (error: any) {
      console.error("Health Check Error:", error.message);
      res.status(503).json({ status: "offline", error: "Render API is unreachable" });
    }
  });

  app.post("/api/generate", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(401).json({ error: "Gemini API Key is missing or invalid. Please set GEMINI_API_KEY in the Secrets panel." });
      }

      const businessData = req.body;
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `You are a world-class video ad director and copywriter.
You create premium 30-second video ads that convert viewers into customers.

RULES:
- Output exactly 3 variants as a JSON array
- Each variant: exactly 5 scenes HOOK→PROBLEM→SOLUTION→PROOF→CTA
- Frame splits: HOOK=90, PROBLEM=180, SOLUTION=270, PROOF=180, CTA=180
- startFrame/endFrame must be sequential, total=900
- Headlines: max 8 words, punchy, pattern-interrupt
- Subtext: max 15 words, specific, benefit-focused
- Colors: valid hex codes only
- GRADIENT backgroundValue: valid CSS gradient string
- COLOR backgroundValue: valid hex code
- VIDEO backgroundValue: empty string (user provides footage)
- Variant 1: Emotional/Story → tone TRUST or LUXURY
- Variant 2: Problem/Solution → tone URGENT or BOLD
- Variant 3: Social Proof/Results → tone BOLD or ENERGETIC
- Each variant must feel completely different in energy`;

      const prompt = `Generate 3 video ad variants for the following business:
Business Name: ${businessData.businessName}
Niche: ${businessData.niche}
Primary Offer: ${businessData.primaryOffer}
USP: ${businessData.usp}
Target Audience: ${businessData.targetAudience}
Primary Color: ${businessData.primaryColor}
Secondary Color: ${businessData.secondaryColor}
AccentColor: ${businessData.accentColor}
Tone: ${businessData.tone}
Website: ${businessData.website}
Logo URL: ${businessData.logoUrl || 'None'}
Content Video URL: ${businessData.contentVideoUrl || 'None'}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: zodToJsonSchema(VariantsSchema as any) as any,
        },
      });

      const variants = JSON.parse(response.text);
      if (!Array.isArray(variants)) {
        throw new Error("Gemini returned an invalid format (expected an array).");
      }
      res.json(variants);
    } catch (error: any) {
      console.error("Gemini Error:", error);
      const message = error.message || "An unexpected error occurred while generating content.";
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/render", async (req, res) => {
    try {
      const response = await axios.post(`${REMOTION_API_BASE}/render`, req.body);
      res.json(response.data);
    } catch (error: any) {
      console.error("Render Error:", error.response?.data || error.message);
      res.status(500).json(error.response?.data || { error: error.message });
    }
  });

  app.post("/api/render-all", async (req, res) => {
    try {
      const response = await axios.post(`${REMOTION_API_BASE}/render-all`, req.body);
      res.json(response.data);
    } catch (error: any) {
      console.error("Render All Error:", error.response?.data || error.message);
      res.status(500).json(error.response?.data || { error: error.message });
    }
  });

  app.get("/api/status/:jobId", async (req, res) => {
    try {
      const response = await axios.get(`${REMOTION_API_BASE}/status/${req.params.jobId}`);
      res.json(response.data);
    } catch (error: any) {
      console.error("Status Error:", error.response?.data || error.message);
      res.status(500).json(error.response?.data || { error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
