 import express, { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Route 1: Resume ATS Score
app.post("/api/ats-score", async (req: Request, res: Response) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ error: "Resume text required" });

    const prompt = `Analyze this resume and give ATS score out of 100 with improvements. Resume: ${resumeText}. Return JSON: {"score": 85, "improvements": ["..."]}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ error: "Failed to analyze resume" });
  }
});

// Route 2: Mock Interview Start
app.post("/api/mock-interview", async (req: Request, res: Response) => {
  try {
    const { company, role } = req.body;
    if (!company || !role) {
      return res.status(400).json({ error: "Company and role required" });
    }

    const prompt = `You are an HR from ${company} interviewing for ${role}. Ask the first interview question. Return JSON: {"question": "..."}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ error: "Failed to start interview" });
  }
});

// Route 3: Mock Interview Feedback
app.post("/api/mock-interview/feedback", async (req: Request, res: Response) => {
  try {
    const { company, role, question, answer, questionNumber } = req.body;

    const prompt = `You are HR from ${company} for ${role}. Question: "${question}". Candidate answer: "${answer}". 
    Give score 1-10, critique, improvedAnswer, and nextQuestion. If questionNumber is 5, nextQuestion should say "Interview concludes". 
    Return JSON: {"score": 8, "critique": "...", "improvedAnswer": "...", "nextQuestion": "..."}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ error: "Failed to analyze feedback" });
  }
});

// Route 4: Schemes Finder
app.post("/api/schemes", async (req: Request, res: Response) => {
  try {
    const { age, homeState, educationLevel } = req.body;
    if (!age || !homeState || !educationLevel) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const prompt = `User details: Age ${age}, State ${homeState}, Education ${educationLevel}. 
    List 3 government schemes they are eligible for in India. Return JSON array: [{"name":"...", "description":"...", "eligibility":"...", "link":"..."}]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch schemes" });
  }
});

const PORT
