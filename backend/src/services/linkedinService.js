import axios from 'axios';
import linkedinConfig from '../config/linkedin.js';

// Publish text post to LinkedIn
export const publishTextPost = async (accessToken, linkedInId, content, hashtags = []) => {
  try {
    const fullContent = hashtags.length > 0 
      ? `${content}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`
      : content;

    const postData = {
      author: `urn:li:person:${linkedInId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: fullContent
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await axios.post(
      `${linkedinConfig.apiBaseUrl}/ugcPosts`,
      postData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    console.log('✅ Post published to LinkedIn successfully');
    
    return {
      postId: response.data.id,
      postUrl: `https://www.linkedin.com/feed/update/${response.data.id}/`
    };
  } catch (error) {
    console.error('❌ LinkedIn publish error:', error.response?.data || error);
    throw new Error(`Failed to publish to LinkedIn: ${error.response?.data?.message || error.message}`);
  }
};

// Publish post with image to LinkedIn
export const publishImagePost = async (accessToken, linkedInId, content, imageUrl, hashtags = []) => {
  try {
    // First, register the image upload
    const registerResponse = await axios.post(
      `${linkedinConfig.apiBaseUrl}/assets?action=registerUpload`,
      {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:person:${linkedInId}`,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const asset = registerResponse.data.value.asset;

    // Upload the image
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    await axios.put(uploadUrl, imageResponse.data, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'image/jpeg'
      }
    });

    const fullContent = hashtags.length > 0 
      ? `${content}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`
      : content;

    // Create the post with the image
    const postData = {
      author: `urn:li:person:${linkedInId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: fullContent
          },
          shareMediaCategory: 'IMAGE',
          media: [
            {
              status: 'READY',
              description: {
                text: 'Image'
              },
              media: asset,
              title: {
                text: 'Image'
              }
            }
          ]
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await axios.post(
      `${linkedinConfig.apiBaseUrl}/ugcPosts`,
      postData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    console.log('✅ Image post published to LinkedIn successfully');
    
    return {
      postId: response.data.id,
      postUrl: `https://www.linkedin.com/feed/update/${response.data.id}/`
    };
  } catch (error) {
    console.error('❌ LinkedIn image publish error:', error.response?.data || error);
    throw new Error(`Failed to publish image to LinkedIn: ${error.response?.data?.message || error.message}`);
  }
};

// Fetch post engagement/analytics from LinkedIn
export const fetchPostAnalytics = async (accessToken, postUrn) => {
  try {
    const shareId = postUrn.split(':').pop();
    
    // Try to get post statistics
    try {
      // Method 1: Try UGC Posts endpoint
      const response = await axios.get(
        `${linkedinConfig.apiBaseUrl}/ugcPosts/${shareId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': '202304'
          },
          params: {
            fields: 'totalSocialActivityCounts'
          }
        }
      );
      
      if (response.data && response.data.totalSocialActivityCounts) {
        const counts = response.data.totalSocialActivityCounts;
        const engagement = {
          likes: counts.numLikes || 0,
          comments: counts.numComments || 0,
          shares: counts.numShares || 0,
          impressions: counts.numViews || counts.numImpressions || 0
        };
        
          return engagement;
      }
    } catch (apiError) {
    }

    // Method 2: Try getting basic engagement from share statistics
    try {
      const shareResponse = await axios.get(
        `${linkedinConfig.apiBaseUrl}/shares/${shareId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );
      
      if (shareResponse.data && shareResponse.data.totalSocialActivityCounts) {
        const engagement = {
          likes: shareResponse.data.totalSocialActivityCounts?.numLikes || 0,
          comments: shareResponse.data.totalSocialActivityCounts?.numComments || 0,
          shares: shareResponse.data.totalSocialActivityCounts?.numShares || 0,
          impressions: shareResponse.data.totalSocialActivityCounts?.numViews || 0
        };
        
        return engagement;
      }
    } catch (shareError) {
    }

    // If all methods fail, return null (no data)
    if (!global.linkedInAnalyticsWarningShown) {
      global.linkedInAnalyticsWarningShown = true;
    }
    
    return null;
    
  } catch (error) {
    return null;
  }
};

// Get LinkedIn profile info
export const getProfile = async (accessToken) => {
  try {
    const response = await axios.get(`${linkedinConfig.apiBaseUrl}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.data;
  } catch (error) {
    throw new Error('Failed to get LinkedIn profile');
  }
};

export default { publishTextPost, publishImagePost, fetchPostAnalytics, getProfile };
