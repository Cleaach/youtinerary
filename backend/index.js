// index.js
const express = require('express');
const cors = require('cors');
const { generateItinerary } = require('./openaiService');

const app = express();
const PORT = 2200;

app.use(express.json());
app.use(cors());

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Express API!' });
});

app.post('/api/itinerary', async (req, res) => {
    const { startDate, endDate, group, pace, interests, budget, destinations } = req.body;

    const prompt = `
        Generate an itinerary from ${startDate} to ${endDate} 
        for a ${group} with a ${pace} pace.
        Interests: ${interests.join(', ')}.
        Budget: ${budget}.
        Destinations: ${destinations.join(', ')}.
        Format as a json (excluding carriage return):
        {
            "itinerary": {
                "preferences": {
                    "pace": "<input>",
                    "budget": "<input>",
                    "group": "<input>",
                    "interests": ["<input1>", "<input2>", ..."]
            },
            "days": [
                {
                    "dayNumber": <output>,
                    "date": "<output>",
                    "destinations": [
                        {
                            "name": "<output>",
                            "longitude": "<output>",
                            "latitude": "<output>"
                        }
                    ]
                },
                {
                    "dayNumber": <output>,
                    "date": "<output>",
                    "destinations": [
                        {
                            "name": "<output>",
                            "longitude": "<output>",
                            "latitude": "<output>"
                        }
                    ]
                },
            }
        }
    `;

    try {
        const itinerary = await generateItinerary(prompt);
        res.json({ itinerary });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Could not generate itinerary' });
    }
});

app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});
