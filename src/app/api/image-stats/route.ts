import { NextResponse } from 'next/server';
import { getImageUsageStats } from '@/lib/imageGeneration';

export async function GET() {
  try {
    const stats = getImageUsageStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Image usage statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting image usage stats:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get image usage statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    message: 'Image Usage Statistics API',
    description: 'Tracks RSS vs Unsplash image usage with 80/20 priority system',
    priority: 'RSS feeds > Unsplash (1 in 5 runs)',
    endpoints: {
      GET: 'Get current usage statistics'
    }
  });
}
