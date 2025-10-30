import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load prompts from JSON file
const promptsPath = join(__dirname, 'prompts.json');
const prompts = JSON.parse(readFileSync(promptsPath, 'utf-8'));

/**
 * Get post generation prompt template
 * @param {Object} params - Template parameters
 * @returns {String} Formatted prompt
 */
export const getPostGenerationPrompt = (params) => {
  const {
    topicName,
    topicDescription,
    keywords,
    previousPosts,
    tone,
    targetLength,
    targetEmojis
  } = params;

  const toneDesc = prompts.postGeneration.toneDescriptions[tone] || 
                   prompts.postGeneration.toneDescriptions.professional;

  // Build context section
  let context = '';
  if (topicDescription) {
    context = prompts.postGeneration.contextTemplate
      .replace('{description}', topicDescription) + '\n';
  }

  // Build keywords section
  let keywordsSection = '';
  if (keywords && keywords.length > 0) {
    keywordsSection = prompts.postGeneration.keywordsTemplate
      .replace('{keywords}', keywords.join(', ')) + '\n';
  }

  // Build previous posts section
  let previousPostsSection = '';
  if (previousPosts) {
    previousPostsSection = prompts.postGeneration.previousPostsTemplate
      .replace('{previousPosts}', previousPosts);
  }

  // Build final prompt
  return prompts.postGeneration.template
    .replace('{topicName}', topicName)
    .replace('{context}', context)
    .replace('{keywords}', keywordsSection)
    .replace('{previousPosts}', previousPostsSection)
    .replace('{tone}', toneDesc)
    .replace('{targetLength}', targetLength)
    .replace('{targetEmojis}', targetEmojis);
};

/**
 * Get image generation design prompt with topic-specific guidance
 * @param {String} content - Post content
 * @param {String} topicName - Topic name
 * @returns {String} Formatted prompt with topic-specific styles
 */
export const getImageDesignPrompt = (content, topicName) => {
  const basePrompt = prompts.imageGeneration.designPrompt
    .replace('{content}', content.substring(0, 500))
    .replace(/{topicName}/g, topicName);
  
  // Add topic-specific style guidance if available
  const topicStyle = prompts.imageGeneration.topicSpecificStyles[topicName];
  if (topicStyle) {
    const styleGuidance = `\n\n🎨 TOPIC-SPECIFIC GUIDANCE FOR "${topicName}":\n` +
      `- Visual Style: ${topicStyle.style}\n` +
      `- Icons to Use: ${topicStyle.iconStyle}\n` +
      `- Content Focus: ${topicStyle.contentFocus}\n` +
      `- Example Approach: ${topicStyle.example}\n` +
      `\nAdapt the infographic to match this topic's style while maintaining text clarity and information density.`;
    return basePrompt + styleGuidance;
  }
  
  return basePrompt;
};

/**
 * Get technical specs for image generation
 * @returns {String} Technical specifications
 */
export const getImageTechnicalSpecs = () => {
  return prompts.imageGeneration.technicalSpecs;
};

/**
 * Get fallback image prompt template with topic-specific customization
 * @param {Object} params - Template parameters
 * @returns {String} Formatted fallback prompt
 */
export const getImageFallbackPrompt = (params) => {
  const { headline, topicName } = params;
  
  const colors = prompts.imageGeneration.colorSchemes[topicName] || 
                 prompts.imageGeneration.colorSchemes.default;
  
  const topicStyle = prompts.imageGeneration.topicSpecificStyles[topicName];

  let prompt = prompts.imageGeneration.fallbackTemplate
    .replace(/{headline}/g, headline)
    .replace(/{topicName}/g, topicName)
    .replace(/{bgColor}/g, colors.bg)
    .replace(/{primaryColor}/g, colors.primary)
    .replace(/{secondaryColor}/g, colors.secondary);
  
  // Add topic-specific guidance
  if (topicStyle) {
    prompt += `\n\n**TOPIC-SPECIFIC CUSTOMIZATION:**\n` +
      `- Style: ${topicStyle.style}\n` +
      `- Icons: ${topicStyle.iconStyle}\n` +
      `- Focus: ${topicStyle.contentFocus}`;
  }
  
  return prompt;
};

/**
 * Get color scheme for a topic
 * @param {String} topicName - Topic name
 * @returns {Object} Color scheme
 */
export const getColorScheme = (topicName) => {
  return prompts.imageGeneration.colorSchemes[topicName] || 
         prompts.imageGeneration.colorSchemes.default;
};

/**
 * Get topic-specific style guidance
 * @param {String} topicName - Topic name
 * @returns {Object|null} Topic style object or null
 */
export const getTopicStyle = (topicName) => {
  return prompts.imageGeneration.topicSpecificStyles[topicName] || null;
};

export default {
  getPostGenerationPrompt,
  getImageDesignPrompt,
  getImageTechnicalSpecs,
  getImageFallbackPrompt,
  getColorScheme,
  getTopicStyle
};

