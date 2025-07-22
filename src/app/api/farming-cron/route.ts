import { NextResponse } from 'next/server';
import { 
  generateLinkedInFarmingPost, 
  generateTechTipsPost, 
  generateCareerStoryPost, 
  generateEngagementPost 
} from '@/lib/linkedinFarming';
import { getRandomTemplate } from '@/lib/contentTypes';
import axios from 'axios';

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN!;
const LINKEDIN_PERSON_URN = process.env.LINKEDIN_PERSON_URN!;

export async function GET() {
  console.log('Farming cron job started at:', new Date().toISOString());
  
  try {
    const template = getRandomTemplate();
    let post: string;
    let postType: string;
    
    switch (template.type) {
      case 'advice':
        if (template.category === 'tech') {
          post = await generateTechTipsPost();
          postType = 'Tech Tips';
        } else {
          post = await generateLinkedInFarmingPost();
          postType = 'General Advice';
        }
        break;
      case 'story':
      case 'lesson':
        if (template.category === 'career') {
          post = await generateCareerStoryPost();
          postType = 'Career Story';
        } else {
          post = await generateLinkedInFarmingPost();
          postType = 'Story/Lesson';
        }
        break;
      case 'question':
        post = await generateEngagementPost();
        postType = 'Engagement Question';
        break;
      default:
        post = await generateLinkedInFarmingPost();
        postType = 'General Farming';
        break;
    }
    
    console.log(`Generated ${postType} post:`, post);
    
    const linkedinResponse = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        author: LINKEDIN_PERSON_URN,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: post
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      },
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
      post: post
    });
    
  } catch (error) {
    console.error('Error in farming cron job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create and publish farming post' },
      { status: 500 }
    );
  }
}
