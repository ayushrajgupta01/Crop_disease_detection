const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const jwt = require('jsonwebtoken');

// Model Imports
const User = require('./models/User');
const Post = require('./models/Post');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.GEMINI_API_KEY) {
    console.log('Gemini API Key detected.');
} else {
    console.warn('Gemini API Key MISSING in .env file.');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cropguard')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

app.get('/', (req, res) => res.send('CropGuard API is running...'));

// Chatbot Endpoint with Modern (2026) Model Support and Fallback
app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    let apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.json({ reply: "API Key is missing. Please check your .env file." });
    }

    apiKey = apiKey.trim().replace(/^["']|["']$/g, '');
    const genAI = new GoogleGenerativeAI(apiKey);

    // Updated 2026 model list from actual available models
    const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest"];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting chat with model: ${modelName}`);

            // Using v1beta for better feature support (like system instructions)
            const model = genAI.getGenerativeModel(
                {
                    model: modelName,
                    systemInstruction: {
                        role: "system",
                        parts: [{
                            text: `You are AgroBot, a precision agriculture AI. Your objective is to provide professional, high-density, and actionable advice for a crop disease detection platform.

                        STRICT RESPONSE RULES:
                        1. **Identity & Greetings**: If the user says "Hello", "Hi", or greets you, respond ONLY with: "Hello. I am AgroBot, your specialized Crop AI. How can I assist you with your crops today?"
                        2. **Scope Control**: If the query is NOT related to agriculture, farming, crops, or soil, respond ONLY with: "I am a specialized Crop AI. Please ask questions related to agriculture, crop diseases, or farming practices."
                        3. **Ultra-Concise (For Ag Queries)**: Maximum 3-4 sections. No conversational filler.
                        4. **Production Focus**: Provide direct recommendations: Specific **NPK ratios**, **Chemical/Organic treatments**, and **Dosage/Timing**.
                        5. **Formatting**: Use '###' for headers and '**' for key terms. Use bullet points ONLY.` }]
                    }
                },
                { apiVersion: "v1beta" }
            );

            let sanitizedHistory = history || [];
            // Ensure history is in the correct format for the SDK
            if (sanitizedHistory.length > 0 && sanitizedHistory[0].role !== 'user') {
                sanitizedHistory = sanitizedHistory.slice(1);
            }

            const chat = model.startChat({
                history: sanitizedHistory,
                generationConfig: {
                    maxOutputTokens: 2048,
                    temperature: 0.4
                }
            });

            const result = await chat.sendMessage(message);
            const response = await result.response;
            const text = response.text();

            if (text) {
                return res.json({ reply: text });
            } else {
                throw new Error("Empty response from model");
            }

        } catch (error) {
            console.error(`Failed with ${modelName}:`, error.message);
            lastError = error;
            // Fallback for most common errors that aren't API Key issues
            const errorMessage = error.message.toLowerCase();
            if (
                errorMessage.includes("404") ||
                errorMessage.includes("not found") ||
                errorMessage.includes("400") ||
                errorMessage.includes("503") ||
                errorMessage.includes("500") ||
                errorMessage.includes("429") ||
                errorMessage.includes("quota") ||
                errorMessage.includes("demand") ||
                errorMessage.includes("overloaded")
            ) {
                console.log(`Falling back from ${modelName} due to: ${error.message}`);
                continue;
            } else {
                // For Auth (401/403) or other fatal errors, stop immediately
                break;
            }
        }
    }

    res.status(500).json({
        error: "Chat service unavailable.",
        details: lastError ? lastError.message : "Unknown error"
    });
});

app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;
    const weatherKey = process.env.WEATHER_API_KEY;

    try {
        let weatherData;

        if (weatherKey) {
            // Real API Call (OpenWeatherMap)
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherKey}&units=metric`;
            const response = await axios.get(url);
            const data = response.data;
            weatherData = {
                temp: data.main.temp,
                condition: data.weather[0].main,
                humidity: data.main.humidity,
                wind: (data.wind.speed * 3.6).toFixed(1), // convert m/s to km/h
                city: data.name
            };
        } else {
            // Simulation Mode (High-quality mock data for testing logic)
            weatherData = {
                temp: 28 + Math.random() * 5,
                condition: Math.random() > 0.7 ? 'Rainy' : 'Cloudy',
                humidity: 75 + Math.random() * 15, // High humidity for simulation
                wind: 18 + Math.random() * 10,     // High wind for simulation
                city: "Local Field (Simulated)"
            };
        }

        let alerts = [];

        // 1. Pesticide Warning (Wind > 15 km/h)
        if (parseFloat(weatherData.wind) > 15) {
            alerts.push({
                type: "warning",
                msg: "High winds detected. Postpone pesticide spraying to prevent chemical drift."
            });
        }

        // 2. Fertilizer Warning (Rainy condition)
        if (weatherData.condition.includes('Rain')) {
            alerts.push({
                type: "danger",
                msg: "Heavy rain detected/expected. Do not apply surface fertilizers as they will wash away."
            });
        }

        // 3. Disease Outbreak Warning (High Humidity > 80%)
        if (weatherData.humidity > 80) {
            alerts.push({
                type: "info",
                msg: "High humidity (>80%) detected. Perfect conditions for Fungal Blight (Late Blight). Monitor crops closely."
            });
        }

        res.json({ ...weatherData, alerts });

    } catch (error) {
        console.error('Weather error:', error.message);
        res.status(500).json({ error: "Weather service error", details: error.message });
    }
});

app.post('/api/predict', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    try {
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('image', fs.createReadStream(req.file.path));
        const response = await axios.post('http://localhost:5001/predict', formData, { headers: formData.getHeaders() });
        res.json({ imageUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`, ...response.data });
    } catch (error) {
        res.status(500).json({ error: 'ML service unreachable.' });
    }
});

// Authentication Middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cropguard_secret_key_2026');
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new Error();
        }
        req.user = user;
        req.token = token;
        next();
    } catch (e) {
        res.status(401).json({ error: 'Authentication failed. Please login again.' });
    }
};

// --- Authentication Endpoints ---

// Signup Route
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password, location } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields (username, email, password) are required.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or Email already registered' });
        }

        const user = new User({ username, email, password, location: location || 'Unknown' });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'cropguard_secret_key_2026', { expiresIn: '7d' });
        res.status(201).json({
            user: { id: user._id, username: user.username, email: user.email, location: user.location },
            token
        });
    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        if (!emailOrUsername || !password) {
            return res.status(400).json({ error: 'Username/Email and Password are required.' });
        }

        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: emailOrUsername.toLowerCase() },
                { username: emailOrUsername }
            ]
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid login credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid login credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'cropguard_secret_key_2026', { expiresIn: '7d' });
        res.json({
            user: { id: user._id, username: user.username, email: user.email, location: user.location },
            token
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get User Profile Route (Optional check token route)
app.get('/api/auth/me', auth, async (req, res) => {
    res.json({ id: req.user._id, username: req.user.username, email: req.user.email, location: req.user.location });
});

// --- Post Endpoints ---

// Get All Posts (Dynamic + Seed initial mock data if empty)
app.get('/api/posts', async (req, res) => {
    try {
        let posts = await Post.find().sort({ createdAt: -1 });

        if (posts.length === 0) {
            console.log('Seeding initial mock posts into database...');
            let seedUser = await User.findOne({ username: 'Ramesh K.' });
            let userId;

            if (seedUser) {
                userId = seedUser._id;
            } else {
                const mockUser = new User({
                    username: 'Ramesh K.',
                    email: 'ramesh@example.com',
                    password: 'password123',
                    location: 'Karnataka'
                });
                await mockUser.save();
                userId = mockUser._id;
            }

            const seedPosts = [
                {
                    user: userId,
                    username: 'Ramesh K.',
                    location: 'Karnataka',
                    crop: 'Tomato',
                    content: 'My tomato crops are finally recovering after using the recommended copper spray from AgroBot. Thanks everyone!',
                    image: 'https://images.unsplash.com/photo-1558818498-28c1e002b655?auto=format&fit=crop&q=80&w=400',
                    likes: [],
                    comments: []
                },
                {
                    user: userId,
                    username: 'Anita S.',
                    location: 'Maharashtra',
                    crop: 'Rice',
                    content: 'Anyone else seeing early signs of Rice Blast in the Pune region? The humidity has been very high lately.',
                    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
                    likes: [],
                    comments: []
                }
            ];
            await Post.insertMany(seedPosts);
            posts = await Post.find().sort({ createdAt: -1 });
        }
        res.json(posts);
    } catch (error) {
        console.error('Fetch posts error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Create Post (Requires Auth)
app.post('/api/posts', auth, upload.single('image'), async (req, res) => {
    try {
        const { content, crop } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Post content is required.' });
        }

        let imageUrl = '';
        if (req.file) {
            const host = req.get('host') || `localhost:${PORT}`;
            imageUrl = `${req.protocol}://${host}/uploads/${req.file.filename}`;
        }

        const post = new Post({
            user: req.user._id,
            username: req.user.username,
            location: req.user.location,
            crop: crop || 'General',
            content,
            image: imageUrl
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        console.error('Create post error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Like/Unlike Post (Requires Auth)
app.post('/api/posts/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const likeIndex = post.likes.indexOf(req.user._id);
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1); // Unlike
        } else {
            post.likes.push(req.user._id); // Like
        }
        await post.save();
        res.json(post);
    } catch (error) {
        console.error('Like post error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Comment on Post (Requires Auth)
app.post('/api/posts/:id/comment', auth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Comment text is required.' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        post.comments.push({
            user: req.user._id,
            username: req.user.username,
            text
        });
        await post.save();
        res.json(post);
    } catch (error) {
        console.error('Comment error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Delete Post (Requires Auth, only author can delete)
app.delete('/api/posts/:id', auth, async (req, res) => {
    try {
        console.log(`[DELETE] Received request to delete post ${req.params.id} by user ${req.user._id}`);
        const post = await Post.findById(req.params.id);
        if (!post) {
            console.log(`[DELETE] Post ${req.params.id} not found.`);
            return res.status(404).json({ error: 'Post not found.' });
        }

        console.log(`[DELETE] Post Author ID: ${post.user}, Requestor ID: ${req.user._id}`);

        // Check if the current user is the author of the post (with safety check)
        if (!post.user || post.user.toString() !== req.user._id.toString()) {
            console.log(`[DELETE] Unauthorized attempt. Author is ${post.user}, requester is ${req.user._id}`);
            return res.status(403).json({ error: 'Unauthorized to delete this post.' });
        }

        await Post.findByIdAndDelete(req.params.id);
        console.log(`[DELETE] Post ${req.params.id} deleted successfully.`);
        res.json({ message: 'Post deleted successfully.' });
    } catch (error) {
        console.error('Delete post error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
