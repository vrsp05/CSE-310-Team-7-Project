import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeResume(jobDescription, resumeText) {
  // We use Gemini 1.5 Flash because it's fast and has a huge free tier
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "You are a professional career coach. Analyze the resume against the job description and provide 3 specific improvements."
  });

  const prompt = `Job Description: ${jobDescription}\n\nResume: ${resumeText}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}