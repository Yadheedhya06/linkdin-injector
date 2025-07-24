import { NextRequest, NextResponse } from 'next/server';
import { 
  generateLinkedInFarmingPostWithImages,
  generateTechTipsPostWithImages,
  generateCareerStoryPostWithImages,
  generateEngagementPostWithImages
} from '@/lib/linkedinFarming';

export async function POST(request: NextRequest) {
  try {
    const { 
      type = 'farming', 
      techStack, 
      imageSource = 'unsplash', 
      imageCount = 1,
      includeImages = false 
    } = await request.json();

    let result;

    if (includeImages) {
      // Generate posts with images
      switch (type) {
        case 'tech':
          result = await generateTechTipsPostWithImages(techStack, imageSource, imageCount);
          break;
        case 'career':
          result = await generateCareerStoryPostWithImages(imageSource, imageCount);
          break;
        case 'engagement':
          result = await generateEngagementPostWithImages(imageSource, imageCount);
          break;
        default:
          result = await generateLinkedInFarmingPostWithImages(imageSource, imageCount);
      }
    } else {
      // Import the non-image functions for backward compatibility
      const { 
        generateLinkedInFarmingPost,
        generateTechTipsPost,
        generateCareerStoryPost,
        generateEngagementPost
      } = await import('@/lib/linkedinFarming');

      // Generate posts without images (legacy behavior)
      switch (type) {
        case 'tech':
          const content = await generateTechTipsPost(techStack);
          result = { content, images: [], imageSuggestions: [] };
          break;
        case 'career':
          const careerContent = await generateCareerStoryPost();
          result = { content: careerContent, images: [], imageSuggestions: [] };
          break;
        case 'engagement':
          const engagementContent = await generateEngagementPost();
          result = { content: engagementContent, images: [], imageSuggestions: [] };
          break;
        default:
          const farmingContent = await generateLinkedInFarmingPost();
          result = { content: farmingContent, images: [], imageSuggestions: [] };
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        type,
        techStack,
        includeImages,
        imageCount: result.images?.length || 0,
        suggestionsCount: result.imageSuggestions?.length || 0
      }
    });

  } catch (error) {
    console.error('Error generating LinkedIn post:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate LinkedIn post',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'LinkedIn Post Generator with Images',
    endpoints: {
      POST: {
        description: 'Generate LinkedIn posts with optional images',
        parameters: {
          type: 'farming | tech | career | engagement',
          techStack: 'string (optional, for tech posts)',
          imageSource: 'unsplash | pexels | ai',
          imageCount: 'number (default: 1)',
          includeImages: 'boolean (default: false)'
        },
        example: {
          type: 'tech',
          techStack: 'React',
          imageSource: 'unsplash',
          imageCount: 1,
          includeImages: true
        }
      }
    },
    requirements: {
      environment: [
        'GOOGLE_GENERATIVE_AI_API_KEY (required)',
        'UNSPLASH_ACCESS_KEY (optional, for Unsplash images)',
        'PEXELS_API_KEY (optional, for Pexels images)'
      ]
    }
  });
}
