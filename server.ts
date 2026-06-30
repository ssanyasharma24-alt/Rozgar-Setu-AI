import express, { Request, Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";

const app = express();
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey });

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Route 1: ATS Resume Scorer
app.post("/api/ats-score", async (req: Request, res: Response) => {
  try {
    const { resumeBase64, resumeType, resumeText, jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: "Job Description is required" });
    }
    // Tera baaki ka ATS code yahan...
    res.json({ score: 85 }); // dummy response
  } catch (error) {
    res.status(500).json({ error: "Failed to score resume" });
  }
});

// Tera baaki ka /api/analyze, /api/interview etc yahan rahega...

async function startServer() {
  const port = Number(process.env.PORT) || 8080;
  
  // Production ke liye bas ye chahiye
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}
// Route 2: Mock Interview
app.post("/api/interview", async (req: Request, res: Response) => {
  try {
    const { company, role, history } = req.body;
    
    if (!company || !role) {
      return res.status(400).json({ error: "Company and Role are required" });
    }

    const prompt = `You are a senior HR from ${company} taking interview for ${role}. 
    Previous conversation: ${JSON.stringify(history)}
    Ask exactly ONE question. Return JSON: { "question": "...", "isLastQuestion": false }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate interview question" });
  }
});
// Route 3: Schemes Finder
app.post("/api/schemes", async (req: Request, res: Response) => {
  try {
    const { age, homeState, educationLevel } = req.body;
    
    if (!age || !homeState || !educationLevel) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const prompt = `You are Rozgar Setu AI. User details: Age ${age}, State ${homeState}, Education ${educationLevel}. 
    List 3 government schemes they are eligible for in India. Return JSON array: [{"name":"...", "description":"...", "eligibility":"...", "link":"..."}]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch schemes" });
  }
});

startServer();
