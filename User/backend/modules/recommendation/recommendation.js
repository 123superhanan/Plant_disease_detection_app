import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const getRecommendation = async (req, res) => {
  try {
    const { location, crop, growth_stage, season } = req.body;

    console.log('Getting recommendation for:', { location, crop, growth_stage, season });

    // Call your Python recommendation model (FastAPI)
    const response = await axios.post(`${AI_SERVICE_URL}/recommend`, {
      location,
      crop,
      growth_stage,
      season,
    });

    res.json({
      success: true,
      recommendation: response.data.recommendation || response.data,
      season: season,
      crop: crop,
    });
  } catch (error) {
    console.error('Recommendation error:', error.message);
    res.status(500).json({
      error: 'Failed to get recommendation',
      recommendation: 'Water regularly and monitor for pests. Ensure proper sunlight exposure.',
    });
  }
};
