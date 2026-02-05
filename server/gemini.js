import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
// Import your custom coaching data
import { RESUME_DATA } from './resume_ai_data.js';
import { COVER_LETTER_DATA } from './cover_letter_ai_data.js';
import { INTERVIEW_CONTENT } from './interview_ai_data.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeApplication(jobDescription, resumeText, coverLetterText) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    // We inject your specific JS data here so Gemini knows the BYUI standards
    systemInstruction: `You are a Senior Career Coach. 
    Use these specific standards for your analysis:
    RESUME STANDARDS: ${RESUME_DATA.resume_content}
    COVER LETTER STANDARDS: ${COVER_LETTER_DATA.cover_letter_content}`
  });

  const prompt = `
    Analyze this application for the following job:
    JOB DESCRIPTION: ${jobDescription}
    
    USER RESUME: ${resumeText}
    
    USER COVER LETTER: ${coverLetterText}
    
    Provide a detailed review with suggestions for both the resume and cover letter based on the provided standards.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}