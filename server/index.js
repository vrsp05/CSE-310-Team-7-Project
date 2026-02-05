import { analyzeApplication } from './gemini.js';
import express from 'express';
import dotenv from 'dotenv';
import { supabase } from './db.js';

// This loads your variables from the .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// This allows your server to understand JSON data sent from the frontend
app.use(express.json());

// A simple test route to make sure the server is alive
app.get('/api/health', (req, res) => {
    res.json({ 
        message: "The Job AI Coach Server is running!",
        time: new Date().toLocaleTimeString() 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is flying on http://localhost:${PORT}`);
});

app.post('/api/analyze', async (req, res) => {
    try {
        // Now receiving all THREE pieces of data
        const { jobDescription, resumeText, coverLetterText } = req.body;

        if (!jobDescription || !resumeText || !coverLetterText) {
            return res.status(400).json({ error: "Please provide job description, resume, and cover letter." });
        }

        const feedback = await analyzeApplication(jobDescription, resumeText, coverLetterText);

        res.json({ feedback });

    } catch (error) {
        // THIS LINE IS THE KEY: It prints the REAL error to your VS Code terminal
        console.error("DEBUG - Full Gemini Error:", error);
        res.status(500).json({ error: "The AI coach is having trouble analyzing your files." });
    }
});