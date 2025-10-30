import openai from '../config/openai.js';
import {
  getImageDesignPrompt,
  getImageTechnicalSpecs,
  getImageFallbackPrompt,
  getColorScheme
} from '../config/promptsLoader.js';

/**
 * Generate detailed image prompt for Gemini API
 * Uses GPT to create a comprehensive prompt based on post content
 * @param {String} content - Post content
 * @param {Object} topic - Topic object
 * @param {Object} preferences - User preferences
 * @returns {String} Detailed image generation prompt
 */
export const generateDetailedImagePrompt = async (content, topic, preferences) => {
  try {
    // Get design prompt from centralized prompts JSON
    const designPrompt = getImageDesignPrompt(content, topic.name);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: designPrompt }],
      temperature: 0.7,
      max_tokens: 600
    });

    const detailedPrompt = response.choices[0].message.content.trim();
    
    // Add technical specifications from prompts JSON
    const technicalSpecs = getImageTechnicalSpecs();
    const finalPrompt = detailedPrompt + technicalSpecs;

    return finalPrompt;
  } catch (error) {
    console.error('Detailed prompt generation error:', error);
    return generateTemplatePrompt(content, topic);
  }
};

/**
 * Generate fallback prompt using template
 * Used if GPT generation fails
 * @param {String} content - Post content
 * @param {Object} topic - Topic object
 * @returns {String} Template-based image prompt
 */
const generateTemplatePrompt = (content, topic) => {
  // Extract key points from content
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const headline = lines[0]?.substring(0, 60) || topic.name;
  
  // Get fallback prompt from centralized prompts JSON
  return getImageFallbackPrompt({
    headline,
    topicName: topic.name,
    colorScheme: getColorScheme(topic.name)
  });
};

export default { generateDetailedImagePrompt };


