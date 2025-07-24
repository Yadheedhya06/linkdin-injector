import axios from 'axios';

export interface LinkedInImageUpload {
  mediaUrn: string;
  uploadUrl: string;
}

export async function uploadImageToLinkedIn(imageUrl: string, accessToken: string, personUrn: string): Promise<string> {
  try {
    console.log(`Uploading image to LinkedIn: ${imageUrl}`);
    
    const registerUploadResponse = await axios.post(
      'https://api.linkedin.com/v2/assets?action=registerUpload',
      {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: personUrn,
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
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    const uploadUrl = registerUploadResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const asset = registerUploadResponse.data.value.asset;

    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data);

    await axios.put(uploadUrl, imageBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    });

    console.log(`Image uploaded successfully. Asset URN: ${asset}`);
    return asset;

  } catch (error) {
    console.error('Error uploading image to LinkedIn:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
    }
    throw new Error('Failed to upload image to LinkedIn');
  }
}

export function createLinkedInPostWithImage(text: string, mediaUrn: string, personUrn: string) {
  return {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: text
        },
        shareMediaCategory: 'IMAGE',
        media: [
          {
            status: 'READY',
            description: {
              text: 'Generated image for LinkedIn post'
            },
            media: mediaUrn,
            title: {
              text: 'Post Image'
            }
          }
        ]
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };
}

export function createLinkedInPostTextOnly(text: string, personUrn: string) {
  return {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: text
        },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };
}
