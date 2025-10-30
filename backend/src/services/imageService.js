import cloudinary from '../config/cloudinary.js';
import axios from 'axios';

// Upload image to Cloudinary with optimization
export const uploadImageToCloudinary = async (imageSource, postId) => {
  try {
    console.log('📤 Uploading image to Cloudinary...');

    let uploadResult;

    // Check if image is base64 data URL or regular URL
    if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
      // Base64 data URL (from Gemini)
      uploadResult = await cloudinary.uploader.upload(imageSource, {
        folder: 'autolink/posts',
        public_id: `post_${postId}`,
        transformation: [
          {
            quality: 'auto:good',
            fetch_format: 'auto',
            width: 1024,
            height: 1024,
            crop: 'limit'
          },
          {
            flags: 'lossy',
            quality: 85
          }
        ],
        resource_type: 'image'
      });
    } else {
      // Regular URL (from OpenAI or other sources)
      uploadResult = await cloudinary.uploader.upload(imageSource, {
        folder: 'autolink/posts',
        public_id: `post_${postId}`,
        transformation: [
          {
            quality: 'auto:good',
            fetch_format: 'auto',
            width: 1024,
            height: 1024,
            crop: 'limit'
          },
          {
            flags: 'lossy',
            quality: 85
          }
        ],
        resource_type: 'image'
      });
    }

    console.log(`✅ Image uploaded to Cloudinary: ${uploadResult.secure_url}`);
    console.log(`   Original size: ${(uploadResult.bytes / 1024).toFixed(2)} KB`);
    console.log(`   Format: ${uploadResult.format}`);

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    // Return original URL if Cloudinary fails
    return {
      url: typeof imageSource === 'string' && !imageSource.startsWith('data:') ? imageSource : null,
      publicId: null,
      error: error.message
    };
  }
};

// Delete image from Cloudinary
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    
    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Image deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
  }
};

export default {
  uploadImageToCloudinary,
  deleteImageFromCloudinary
};
