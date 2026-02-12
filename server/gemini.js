import './config.js'; // Load environment variables
import { GoogleGenerativeAI } from "@google/generative-ai";
// Import your custom coaching data
import { RESUME_DATA } from './resume_ai_data.js';
import { COVER_LETTER_DATA } from './cover_letter_ai_data.js';
import { INTERVIEW_CONTENT } from './interview_ai_data.js';

// TEMPORARY TEST - DELETE AFTER TESTING
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

export async function getNextQuestion(jobDescription, resumeText, previousQuestions = []) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    systemInstruction: `You are an expert recruiter. Use this bank: ${INTERVIEW_CONTENT.interview_content}.
    1. Identify the industry from the job description.
    2. Pick 1 question that hasn't been asked yet: ${previousQuestions.join(', ')}.
    3. Tailor the question slightly to the user's resume: ${resumeText}.`
  });

  const prompt = `Provide the next interview question for this role: ${jobDescription}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function evaluateAnswer(question, userAnswer, jobDescription) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    systemInstruction: "You are a helpful interview coach. Analyze the user's answer for technical accuracy and delivery."
  });

  const prompt = `
    Question: ${question}
    User's Answer: ${userAnswer}
    Target Job: ${jobDescription}
    
    Provide a score (1-10) and 2 specific tips to improve this answer for the next time.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}