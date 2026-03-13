import axios from 'axios';
import 'dotenv/config';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Generates lead intelligence (score and icebreaker) using Claude API.
 * @param {Object} leadData - Data about the lead (name, website, etc.)
 * @returns {Promise<Object>} - { score, icebreaker }
 */
export const generateLeadIntelligence = async (leadData) => {
    if (!CLAUDE_API_KEY || CLAUDE_API_KEY.includes('xxx')) {
        console.warn('⚠️ CLAUDE_API_KEY not set or invalid. Using simulation.');
        return {
            score: Math.floor(Math.random() * 40) + 60,
            icebreaker: `Simulation: Hallo ${leadData.name}, ik zag jullie website (${leadData.website}). Hoe gaat het met de vloot?`
        };
    }

    try {
        const prompt = `
You are a sales assistant for FleetTrack CRM, a Dutch logistics fleet management software.
Analyze this lead information and provide:
1. A lead score (0-100) based on how likely they are to need fleet management (transport, construction, cleaning companies are high score).
2. A personalized, professional "icebreaker" message in Dutch (Manners: informal but professional, "je/jij" is common in NL startups/SMEs).

Lead Info:
Name: ${leadData.name}
Website: ${leadData.website}
Sector: ${leadData.sector}
Location: ${leadData.location}

Format your response as a JSON object: {"score": number, "icebreaker": "string"}
Do not include any other text in your response.
`;

        const response = await axios.post(CLAUDE_API_URL, {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 300,
            messages: [{ role: 'user', content: prompt }]
        }, {
            headers: {
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            }
        });

        const content = response.data.content[0].text;
        const result = JSON.parse(content.match(/\{.*\}/s)[0]);
        return {
            score: result.score || 50,
            icebreaker: result.icebreaker || `Hallo ${leadData.name}, hoe gaat het?`
        };
    } catch (err) {
        console.error('❌ Claude API Error:', err.message);
        return {
            score: 50,
            icebreaker: `Hallo ${leadData.name}, ik zag jullie bedrijf in ${leadData.location} en wilde even contact opnemen.`
        };
    }
};
