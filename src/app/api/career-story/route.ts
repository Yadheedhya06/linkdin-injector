import { NextResponse } from 'next/server';
import { generateCareerStoryPost, generateCareerStoryPostWithImages } from '@/lib/linkedinFarming';
import { uploadImageToLinkedIn, createLinkedInPostWithImage, createLinkedInPostTextOnly } from '@/lib/linkedinImageUpload';
import axios from 'axios';

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN!;
const LINKEDIN_PERSON_URN = process.env.LINKEDIN_PERSON_URN!;

export async function POST(request: Request) {
  try {
    const { includeImages = true } = await request.json().catch(() => ({ includeImages: true }));
    
    console.log('Generating career story post with images:', includeImages);
    
    let postBody;
    
    if (includeImages) {
      const postWithImages = await generateCareerStoryPostWithImages('unsplash', 1);
      console.log('Generated post:', postWithImages.content);
      console.log('Images found:', postWithImages.images.length);
      
      if (postWithImages.images.length > 0) {
        try {
          const mediaUrn = await uploadImageToLinkedIn(
            postWithImages.images[0].url,
            LINKEDIN_ACCESS_TOKEN,
            LINKEDIN_PERSON_URN
          );
          
          postBody = createLinkedInPostWithImage(postWithImages.content, mediaUrn, LINKEDIN_PERSON_URN);
          console.log('Post will include image attachment');
        } catch (imageError) {
          console.warn('Image upload failed, posting text only:', imageError);
          postBody = createLinkedInPostTextOnly(postWithImages.content, LINKEDIN_PERSON_URN);
        }
      } else {
        console.log('No images found, posting text only');
        postBody = createLinkedInPostTextOnly(postWithImages.content, LINKEDIN_PERSON_URN);
      }
    } else {
      const post = await generateCareerStoryPost();
      console.log('Generated post:', post);
      postBody = createLinkedInPostTextOnly(post, LINKEDIN_PERSON_URN);
    }
    
    const linkedinResponse = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      postBody,
      {
        headers: {
          'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log('LinkedIn API response:', linkedinResponse.status);
    
    return NextResponse.json({
      success: true,
      message: 'Career story post created and published',
      hasImage: postBody.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory === 'IMAGE',
      postId: linkedinResponse.headers['x-restli-id']
    });
    
  } catch (error) {
    console.error('Error in career story post creation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create career story post' },
      { status: 500 }
    );
  }
}
