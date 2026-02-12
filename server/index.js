import './config.js'; // Load environment variables first
import { analyzeApplication } from './gemini.js';
import express from 'express';
import { supabase } from './db.js';

import path from 'path';
import { fileURLToPath } from 'url';

import { getNextQuestion, evaluateAnswer } from './gemini.js';

import cors from 'cors';

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

app.use(cors()); // This allows the HTML site to talk to your server

// This allows your server to understand JSON data sent from the frontend
app.use(express.json());

// This handles the simple GET request when you visit in the browser
app.get('/', (req, res) => {
    res.send("<h1>Job AI Coach Backend is Active!</h1><p>Use PowerShell to test the API routes.</p>");
});

// A simple test route to make sure the server is alive
app.get('/api/health', (req, res) => {
    res.json({ 
        message: "The Job AI Coach Server is running!",
        time: new Date().toLocaleTimeString() 
    });
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

// Route to get a new question
app.post('/api/interview/next', async (req, res) => {
    const { jobDescription, resumeText, previousQuestions } = req.body;
    const question = await getNextQuestion(jobDescription, resumeText, previousQuestions);
    res.json({ question });
});

// Route to grade the user's spoken answer
app.post('/api/interview/grade', async (req, res) => {
    const { question, userAnswer, jobDescription } = req.body;
    const feedback = await evaluateAnswer(question, userAnswer, jobDescription);
    res.json({ feedback });
});

// --- Place these inside your index.js, before the app.listen line ---

// Route 1: Create a new account
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, username } = req.body;
    
    // Attempt to sign up the user through Supabase
    const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: { display_name: username }
        }
    });

    if (error) return res.status(400).json({ error: error.message });
    
    res.json({ message: "Success! Check your email to confirm.", user: data.user });
});

// Route 2: Log in as an existing user
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) return res.status(400).json({ error: error.message });
    
    res.json({ message: "Login successful", session: data.session });
});

// Route to sign out the user
app.post('/api/auth/logout', async (req, res) => {
    const { error } = await supabase.auth.signOut();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Logged out successfully" });
});

app.post('/api/storage/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const bucket = req.body.bucket; // Multer puts text fields in body

        if (!file) return res.status(400).json({ error: "No file provided" });

        // Get the logged-in user to find their private folder
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return res.status(401).json({ error: "Unauthorized" });

        // Upload to Supabase: folder name is the user's ID
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(`${user.id}/${file.originalname}`, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) return res.status(400).json({ error: error.message });

        res.json({ message: "File is now in the bucket!", path: data.path });

    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ error: "Something went wrong on the server" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is flying on http://localhost:${PORT}`);
});

export default app;