import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze maintenance ticket with Gemini Vision
 * @param {Object} params - Ticket details
 * @param {string} params.imageUrl - Cloudinary URL of the issue
 * @param {string} params.building - Building name
 * @param {string} params.room - Room number
 * @param {string} params.userNote - Optional user note
 * @returns {Promise<Object>} - Structured ticket analysis
 */
export const analyzeTicketWithGemini = async ({ imageUrl, building, room, userNote }) => {
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `You are an expert facilities maintenance ticket analyzer. Analyze this maintenance issue photo and provide a structured assessment.

Context:
- Location: ${building}, Room ${room}
${userNote ? `- User note: ${userNote}` : ''}

Provide your response in this EXACT JSON format:
{
  "category": "Plumbing|Electrical|HVAC|Pest|Furniture|Safety|Other",
  "severity": "Low|Medium|High",
  "summary": "Brief 1-sentence description of the issue",
  "facilitiesDescription": "Clear, professional description for facilities staff (2-3 sentences)",
  "followUpQuestions": ["Question 1", "Question 2"],
  "safetyNotes": ["Safety warning if applicable, otherwise empty array"]
}

Rules:
- Be conservative with severity (only High if truly urgent)
- Safety notes only for genuine hazards (electrical, structural, water damage)
- Follow-up questions should help clarify the issue for repair
- Facilities description should be professional and actionable

Respond ONLY with valid JSON, no additional text.`;

    // Fetch image and convert to base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Image
        }
      }
    ]);

    const responseText = result.response.text();
    
    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate response structure
    if (!analysis.category || !analysis.severity || !analysis.summary) {
      throw new Error('Incomplete analysis from Gemini');
    }

    return {
      ...analysis,
      _model: modelName
    };

  } catch (error) {
    const errorMsg = error?.message || String(error);
    console.error('❌ Gemini AI error:', errorMsg);
    console.error('Full error:', error);
    
    // Return fallback analysis
    return {
      category: 'Other',
      severity: 'Low',
      summary: 'Maintenance issue reported. Manual review needed.',
      facilitiesDescription: `Maintenance issue reported in ${building}, Room ${room}. ${userNote || 'No additional details provided.'}`,
      followUpQuestions: ['Can you provide more details about the issue?'],
      safetyNotes: [],
      _fallback: true,
      _error: error?.message || String(error),
      _model: modelName
    };
  }
};
