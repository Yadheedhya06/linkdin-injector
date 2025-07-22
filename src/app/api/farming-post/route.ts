import { NextResponse } from 'next/server';
import { generateLinkedInFarmingPost } from '@/lib/linkedinFarming';
import axios from 'axios';

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN!;
const LINKEDIN_PERSON_URN = process.env.LINKEDIN_PERSON_URN!;

export async function POST() {
  try {
    console.log('Generating farming post...');
    const post = await generateLinkedInFarmingPost();
    
    console.log('Generated post:', post);
    
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
    
    console.log('LinkedIn API response:', linkedinResponse.status);
    
    return NextResponse.json({
      success: true,
      message: 'Farming post created and published',
      post: post
    });
    
  } catch (error) {
    console.error('Error in farming post creation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create farming post' },
      { status: 500 }
    );
  }
}
