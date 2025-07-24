import { NextResponse } from 'next/server';
import { 
  generateLinkedInFarmingPost, 
  generateTechTipsPost, 
  generateCareerStoryPost, 
  generateEngagementPost,
  generateLinkedInFarmingPostWithImages,
  generateTechTipsPostWithImages,
  generateCareerStoryPostWithImages,
  generateEngagementPostWithImages
} from '@/lib/linkedinFarming';
import { uploadImageToLinkedIn, createLinkedInPostWithImage, createLinkedInPostTextOnly } from '@/lib/linkedinImageUpload';
import { getRandomTemplate } from '@/lib/contentTypes';
import axios from 'axios';

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN!;
const LINKEDIN_PERSON_URN = process.env.LINKEDIN_PERSON_URN!;

export async function GET() {
  console.log('Farming cron job started at:', new Date().toISOString());
  
  try {
    const template = getRandomTemplate();
    let postWithImages: { content: string; images: any[] };
    let postType: string;
    
    switch (template.type) {
      case 'advice':
        if (template.category === 'tech') {
          postWithImages = await generateTechTipsPostWithImages(undefined, 'unsplash', 1);
          postType = 'Tech Tips';
        } else {
          postWithImages = await generateLinkedInFarmingPostWithImages('unsplash', 1);
          postType = 'General Advice';
        }
        break;
      case 'story':
      case 'lesson':
        if (template.category === 'career') {
          postWithImages = await generateCareerStoryPostWithImages('unsplash', 1);
          postType = 'Career Story';
        } else {
          postWithImages = await generateLinkedInFarmingPostWithImages('unsplash', 1);
          postType = 'Story/Lesson';
        }
        break;
      case 'question':
        postWithImages = await generateEngagementPostWithImages('unsplash', 1);
        postType = 'Engagement Question';
        break;
      default:
        postWithImages = await generateLinkedInFarmingPostWithImages('unsplash', 1);
        postType = 'General Farming';
        break;
    }
    
    console.log(`Generated ${postType} post:`, postWithImages.content);
    console.log(`Images found:`, postWithImages.images.length);
    
    let postBody;
    
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
    
    console.log('LinkedIn post published successfully:', linkedinResponse.status);
    
    return NextResponse.json({
      success: true,
      message: `${postType} post published successfully`,
      template: template,
      post: postWithImages.content,
      imagesUsed: postWithImages.images.length
    });
    
  } catch (error) {
    console.error('Error in farming cron job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create and publish farming post' },
      { status: 500 }
    );
  }
}
