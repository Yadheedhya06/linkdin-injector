import { NextResponse } from 'next/server';
import { 
  generateLinkedInFarmingPost, 
  generateTechTipsPost, 
  generateCareerStoryPost, 
  generateEngagementPost 
} from '@/lib/linkedinFarming';

export async function GET() {
  try {
    console.log('Generating test farming posts...');
    
    const farmingPost = await generateLinkedInFarmingPost();
    const techPost = await generateTechTipsPost('React');
    const careerPost = await generateCareerStoryPost();
    const engagementPost = await generateEngagementPost();
    
    return NextResponse.json({
      success: true,
      posts: {
        farming: farmingPost,
        techTips: techPost,
        careerStory: careerPost,
        engagement: engagementPost
      }
    });
    
  } catch (error) {
    console.error('Error generating test posts:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
