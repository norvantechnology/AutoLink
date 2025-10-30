import sharp from 'sharp';
import axios from 'axios';

// Create LinkedIn infographic with text overlay (perfect text clarity)
export const createInfographicWithText = async (backgroundUrl, content, topic) => {
  try {
    console.log('🎨 Creating infographic with text overlay...');

    // Download background image from image generation service
    const response = await axios.get(backgroundUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    // Extract headline and key points from content
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    const headline = lines[0]?.substring(0, 60) || topic.name;
    const keyPoints = lines.slice(1, 5).map(l => l.substring(0, 50));

    // Create SVG overlay with perfect text
    const svgOverlay = `
      <svg width="1024" height="1024">
        <!-- Dark overlay for better text contrast -->
        <rect width="1024" height="1024" fill="rgba(0,0,0,0.3)"/>
        
        <!-- Top Section: Headline -->
        <text x="512" y="150" 
              font-family="Arial, sans-serif" 
              font-size="56" 
              font-weight="bold" 
              fill="white" 
              text-anchor="middle"
              stroke="rgba(0,0,0,0.5)"
              stroke-width="2">
          ${headline.toUpperCase()}
        </text>
        
        <!-- Middle Section: Key Points -->
        ${keyPoints.map((point, i) => `
          <!-- Point ${i + 1} -->
          <circle cx="150" cy="${350 + (i * 120)}" r="20" fill="#0077B5"/>
          <text x="150" y="${358 + (i * 120)}" 
                font-family="Arial" 
                font-size="32" 
                font-weight="bold" 
                fill="white" 
                text-anchor="middle">
            ${i + 1}
          </text>
          <text x="200" y="${358 + (i * 120)}" 
                font-family="Arial" 
                font-size="28" 
                font-weight="600" 
                fill="white">
            ${escapeXml(point)}
          </text>
        `).join('')}
        
        <!-- Bottom: Call to Action -->
        <rect x="312" y="900" width="400" height="80" rx="40" fill="#0077B5"/>
        <text x="512" y="950" 
              font-family="Arial" 
              font-size="32" 
              font-weight="bold" 
              fill="white" 
              text-anchor="middle">
          LEARN MORE
        </text>
      </svg>
    `;

    // Composite text overlay on background
    const finalImage = await sharp(imageBuffer)
      .composite([{
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0
      }])
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log('✅ Infographic created with sharp text overlay');
    
    return finalImage;
  } catch (error) {
    console.error('❌ Image composition error:', error);
    return null;
  }
};

// Escape XML special characters
const escapeXml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export default { createInfographicWithText };

