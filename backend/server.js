const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Setup for Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cropguard')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('CropGuard API is running...');
});

// Mock Weather Route (Farmer Alert)
app.get('/api/weather', async (req, res) => {
    try {
        // In a real app, use: const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Mumbai&appid=${process.env.WEATHER_API_KEY}`);
        // Mocking for now:
        const mockWeather = {
            temp: 32,
            condition: 'Clear',
            humidity: 45,
            alert: 'No severe weather predicted. Ideal for fertilization.'
        };
        res.json(mockWeather);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weather' });
    }
});

// Disease Prediction Route (Proxies to Python Flask)
app.post('/api/predict', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
        const FormData = require('form-data');
        const fs = require('fs');
        const formData = new FormData();
        formData.append('image', fs.createReadStream(req.file.path));

        const flaskUrl = 'http://localhost:5001/predict';
        const response = await axios.post(flaskUrl, formData, {
            headers: formData.getHeaders()
        });
        
        const prediction = response.data;
        
        res.json({
            imageUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`,
            ...prediction
        });

    } catch (error) {
        console.error('Prediction service error:', error.message);
        // Fallback to mock if service is down (optional, but good for stability during dev)
        res.status(500).json({ error: 'Python ML service is currently unreachable.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
