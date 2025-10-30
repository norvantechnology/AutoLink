import { geminiClient } from '../config/geminiConfig.js';

/**
 * Generate image using Gemini 2.5 Flash Image model
 * 
 * Model: gemini-2.5-flash-image
 * - Uses generateContentStream() API (not generateImages())
 * - Requires responseModalities: ['IMAGE', 'TEXT']
 * - Returns streaming response with inline image data
 * - No billing setup required
 * 
 * @param {String} prompt - Detailed image generation prompt
 * @returns {String} Data URL of generated image (base64 encoded)
 * @throws {Error} If API client not initialized or generation fails
 */
export const generateImageWithGemini = async (prompt) => {
  try {
    if (!geminiClient) {
      throw new Error('Gemini API client not initialized - check GEMINI_API_KEY in .env');
    }

    // Truncate prompt to maximum 480 tokens (~1920 characters)
    const MAX_PROMPT_LENGTH = 1920;
    const truncatedPrompt = prompt.substring(0, MAX_PROMPT_LENGTH);

    // Configure request for image generation
    const response = await geminiClient.models.generateContentStream({
      model: 'gemini-2.5-flash-image',
      config: {
        responseModalities: ['IMAGE', 'TEXT']
      },
      contents: [{
        role: 'user',
        parts: [{ text: truncatedPrompt }]
      }]
    });

    // Extract image data from stream
    let imageBase64 = null;
    let mimeType = 'image/png';
    
    for await (const chunk of response) {
      const inlineData = chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (inlineData) {
        imageBase64 = inlineData.data;
        mimeType = inlineData.mimeType || 'image/png';
        break;
      }
    }

    if (!imageBase64) {
      throw new Error('No image data in response stream');
    }
    
    return `data:${mimeType};base64,${imageBase64}`;
  } catch (error) {
    console.error('❌ Gemini image generation failed:', error.message);
    throw error;
  }
};

export default { generateImageWithGemini };
