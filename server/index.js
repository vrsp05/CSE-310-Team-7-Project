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