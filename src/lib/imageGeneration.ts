import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import axios from 'axios';
import { getImagesFromRSSFeeds, RSSImage } from './rssImageExtractor';

const model = google('gemini-2.5-pro');

export interface ImageSuggestion {
  prompt: string;
  keywords: string[];
  style: 'professional' | 'tech' | 'career' | 'motivational' | 'educational';
  description: string;
}

export interface GeneratedImage {
  url: string;
  alt: string;
  source: 'unsplash' | 'pexels' | 'rss' | 'generated';
  attribution?: string;
  tags?: string[];
  description?: string;
  relevanceScore?: number;
  feedName?: string;
  articleTitle?: string;
  articleUrl?: string;
}

export interface ImageSourceTracker {
  rssCount: number;
  unsplashCount: number;
  totalRuns: number;
  shouldUseRSS(): boolean;
  recordUsage(source: 'rss' | 'unsplash'): void;
  getStats(): ImageUsageStats;
}

export interface ImageUsageStats {
  totalRuns: number;
  rssUsage: number;
  unsplashUsage: number;
  rssPercentage: number;
  unsplashPercentage: number;
  nextSource: 'rss' | 'unsplash';
}

class SimpleImageTracker implements ImageSourceTracker {
  private static instance: SimpleImageTracker;
  rssCount: number = 0;
  unsplashCount: number = 0;
  totalRuns: number = 0;

  static getInstance(): SimpleImageTracker {
    if (!SimpleImageTracker.instance) {
      SimpleImageTracker.instance = new SimpleImageTracker();
    }
    return SimpleImageTracker.instance;
  }

  shouldUseRSS(): boolean {
    if (this.totalRuns === 0) return true;
    const unsplashRatio = this.unsplashCount / this.totalRuns;
    return unsplashRatio >= 0.2;
  }

  recordUsage(source: 'rss' | 'unsplash'): void {
    this.totalRuns++;
    if (source === 'rss') {
      this.rssCount++;
    } else {
      this.unsplashCount++;
    }
    console.log(`Image usage: RSS ${this.rssCount}/${this.totalRuns}, Unsplash ${this.unsplashCount}/${this.totalRuns}`);
  }

  getStats(): ImageUsageStats {
    const rssPercentage = this.totalRuns > 0 ? (this.rssCount / this.totalRuns) * 100 : 0;
    const unsplashPercentage = this.totalRuns > 0 ? (this.unsplashCount / this.totalRuns) * 100 : 0;
    const nextSource = this.shouldUseRSS() ? 'rss' : 'unsplash';

    return {
      totalRuns: this.totalRuns,
      rssUsage: this.rssCount,
      unsplashUsage: this.unsplashCount,
      rssPercentage: Math.round(rssPercentage * 100) / 100,
      unsplashPercentage: Math.round(unsplashPercentage * 100) / 100,
      nextSource
    };
  }
}

export async function generateImageSuggestions(postContent: string): Promise<ImageSuggestion[]> {
  const { text } = await generateText({
    model,
    prompt: `Analyze this LinkedIn post content deeply and suggest 3 highly relevant images:

Post Content:
${postContent}

Step 1: Identify the core message, key concepts, and visual elements mentioned or implied
Step 2: Consider the target audience and professional context
Step 3: Generate specific, relevant image suggestions

For each suggestion, provide:
1. A highly specific image prompt that directly relates to the content
2. Targeted keywords extracted from the actual post content
3. The most appropriate style based on the post's tone
4. A detailed explanation of the visual-content connection
5. A confidence score (0.0-1.0) for how well this matches

Return ONLY a valid JSON object:
{
  "suggestions": [
    {
      "prompt": "very specific image description using elements from the post",
      "keywords": ["specific", "post-derived", "keywords"],
      "style": "professional|tech|career|motivational|educational",
      "description": "detailed explanation of the visual-content match",
      "confidenceScore": 0.95,
      "visualElements": ["element1", "element2"],
      "conceptMatch": "how this represents the main concept"
    }
  ]
}

Matching Criteria:
- Extract actual keywords and concepts from the post
- Use visual metaphors that directly relate to the message
- Ensure professional LinkedIn appropriateness
- Avoid generic business imagery unless specifically relevant
- Consider industry-specific visual language
- Match the emotional tone (inspirational, technical, educational, etc.)

Style options: professional, tech, career, motivational, educational`,
    temperature: 0.5,
  });

  try {
    const cleanedText = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(cleanedText);
    return parsed.suggestions || [];
  } catch (error) {
    console.error('Failed to parse image suggestions:', error);
    console.log('Raw AI response:', text);

    const fallbackSuggestions: ImageSuggestion[] = [];
    
    if (postContent.toLowerCase().includes('tech') || postContent.toLowerCase().includes('code')) {
      fallbackSuggestions.push({
        prompt: "Modern workspace with laptop and coding environment",
        keywords: ["technology", "programming", "workspace", "computer"],
        style: "tech",
        description: "Relates to the technical content of the post"
      });
    }
    
    if (postContent.toLowerCase().includes('career') || postContent.toLowerCase().includes('growth')) {
      fallbackSuggestions.push({
        prompt: "Professional growth concept with ascending steps or ladder",
        keywords: ["career", "growth", "success", "professional"],
        style: "career",
        description: "Represents career development theme"
      });
    }
    
    if (fallbackSuggestions.length === 0) {
      fallbackSuggestions.push({
        prompt: "Professional business environment with clean modern aesthetic",
        keywords: ["business", "professional", "workplace", "modern"],
        style: "professional",
        description: "Generic professional image suitable for LinkedIn"
      });
    }
    
    return fallbackSuggestions;
  }
}

async function filterImagesByRelevance(
  images: GeneratedImage[], 
  postContent: string, 
  keywords: string[]
): Promise<GeneratedImage[]> {
  const scoredImages: GeneratedImage[] = [];

  for (const image of images) {
    try {
      let relevanceScore = 0;
      const altText = (image.alt || '').toLowerCase();
      const description = (image.description || '').toLowerCase();
      const tags = (image.tags || []).map(tag => tag.toLowerCase());
      const postLower = postContent.toLowerCase();

      keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (altText.includes(keywordLower)) relevanceScore += 0.3;
        if (description.includes(keywordLower)) relevanceScore += 0.2;
        if (tags.some(tag => tag.includes(keywordLower))) relevanceScore += 0.2;
      });

      const conceptWords = extractConceptWords(postContent);
      conceptWords.forEach(concept => {
        if (altText.includes(concept.toLowerCase()) || 
            description.includes(concept.toLowerCase()) ||
            tags.some(tag => tag.includes(concept.toLowerCase()))) {
          relevanceScore += 0.1;
        }
      });

      const professionalKeywords = ['business', 'professional', 'office', 'work', 'team', 'meeting'];
      if (professionalKeywords.some(word => altText.includes(word) || tags.some(tag => tag.includes(word)))) {
        relevanceScore += 0.1;
      }

      image.relevanceScore = Math.min(relevanceScore, 1.0);
      scoredImages.push(image);
    } catch (error) {
      console.error('Error scoring image relevance:', error);
      image.relevanceScore = 0.5;
      scoredImages.push(image);
    }
  }

  return scoredImages.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
}

function extractConceptWords(postContent: string): string[] {
  const concepts: string[] = [];
  const words = postContent.toLowerCase().match(/\b\w+\b/g) || [];
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those']);
  
  words.forEach(word => {
    if (word.length > 3 && !stopWords.has(word) && /^[a-zA-Z]+$/.test(word)) {
      concepts.push(word);
    }
  });
  
  return [...new Set(concepts)];
}

export async function searchUnsplashImages(keywords: string[], count: number = 3, postContent?: string): Promise<GeneratedImage[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn('Unsplash API key not found. Set UNSPLASH_ACCESS_KEY in your environment.');
    return [];
  }

  try {
    const query = keywords.join(' ');
    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: {
        query,
        per_page: Math.min(count * 3, 30),
        orientation: 'landscape',
        content_filter: 'high',
        order_by: 'relevance',
      },
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    let images = response.data.results.map((photo: any) => ({
      url: photo.urls.regular,
      alt: photo.alt_description || `Image related to ${query}`,
      source: 'unsplash' as const,
      attribution: `Photo by ${photo.user.name} on Unsplash`,
      tags: photo.tags?.map((tag: any) => tag.title) || [],
      description: photo.description || '',
    }));

    if (postContent && images.length > count) {
      images = await filterImagesByRelevance(images, postContent, keywords);
    }

    return images.slice(0, count);
  } catch (error) {
    console.error('Error fetching Unsplash images:', error);
    return [];
  }
}

export async function searchPexelsImages(keywords: string[], count: number = 3, postContent?: string): Promise<GeneratedImage[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn('Pexels API key not found. Set PEXELS_API_KEY in your environment.');
    return [];
  }

  try {
    const query = keywords.join(' ');
    const response = await axios.get(`https://api.pexels.com/v1/search`, {
      params: {
        query,
        per_page: Math.min(count * 3, 80),
        orientation: 'landscape',
      },
      headers: {
        Authorization: apiKey,
      },
    });

    let images = response.data.photos.map((photo: any) => ({
      url: photo.src.large,
      alt: photo.alt || `Image related to ${query}`,
      source: 'pexels' as const,
      attribution: `Photo by ${photo.photographer} on Pexels`,
      description: photo.alt || '',
    }));

    if (postContent && images.length > count) {
      images = await filterImagesByRelevance(images, postContent, keywords);
    }

    return images.slice(0, count);
  } catch (error) {
    console.error('Error fetching Pexels images:', error);
    return [];
  }
}

export async function generateAIImages(prompt: string, count: number = 1): Promise<GeneratedImage[]> {
  /*I've added this function to use models image gen models to generate images*/
  console.log(`AI image generation requested for prompt: "${prompt}"`);
  console.log('AI image generation not yet implemented. Consider using stock photo alternatives.');
  
  return [];
}

export async function getImagesForPost(
  postContent: string,
  preferredSource: 'unsplash' | 'pexels' | 'ai' = 'unsplash',
  imageCount: number = 1
): Promise<{ images: GeneratedImage[]; suggestions: ImageSuggestion[] }> {
  const suggestions = await generateImageSuggestions(postContent);
  const tracker = SimpleImageTracker.getInstance();
  
  if (suggestions.length === 0) {
    return { images: [], suggestions: [] };
  }

  let images: GeneratedImage[] = [];

  try {
    const rssImages = await getImagesFromRSSFeeds(imageCount);
    if (rssImages.length > 0 && tracker.shouldUseRSS()) {
      console.log(`Using RSS images (${rssImages.length} found)`);
      images = rssImages.map(rssImg => ({
        url: rssImg.url,
        alt: rssImg.alt,
        source: 'rss' as const,
        feedName: rssImg.feedName,
        articleTitle: rssImg.articleTitle,
        articleUrl: rssImg.articleUrl
      }));
      tracker.recordUsage('rss');
      return { images: images.slice(0, imageCount), suggestions };
    }
  } catch (error) {
    console.error('Error fetching RSS images:', error);
  }

  const sortedSuggestions = suggestions.sort((a, b) => {
    const scoreA = (a as any).confidenceScore || 0.5;
    const scoreB = (b as any).confidenceScore || 0.5;
    return scoreB - scoreA;
  });

  for (const suggestion of sortedSuggestions.slice(0, imageCount)) {
    try {
      let newImages: GeneratedImage[] = [];

      switch (preferredSource) {
        case 'unsplash':
          newImages = await searchUnsplashImages(suggestion.keywords, 3, postContent);
          break;
        case 'pexels':
          newImages = await searchPexelsImages(suggestion.keywords, 3, postContent);
          break;
        case 'ai':
          newImages = await generateAIImages(suggestion.prompt, 1);
          if (newImages.length === 0) {
            newImages = await searchUnsplashImages(suggestion.keywords, 3, postContent);
          }
          break;
      }
      if (newImages.length > 0) {
        const bestImage = newImages[0];
        images.push(bestImage);
        
        console.log(`Selected image with relevance score: ${bestImage.relevanceScore || 'N/A'}`);
        if (bestImage.relevanceScore && bestImage.relevanceScore < 0.3) {
          console.warn('Low relevance score detected. Consider using fallback images.');
        }
      }
    } catch (error) {
      console.error(`Error getting images for suggestion:`, error);
    }
  }

  if (images.length === 0 || images.every(img => (img.relevanceScore || 0) < 0.3)) {
    console.log('Attempting fallback image search with broader keywords...');
    const fallbackKeywords = extractFallbackKeywords(postContent);
    
    try {
      if (preferredSource !== 'pexels') {
        const fallbackImages = await searchPexelsImages(fallbackKeywords, 2, postContent);
        images.push(...fallbackImages.slice(0, imageCount - images.length));
      }
      if (images.length < imageCount && preferredSource !== 'unsplash') {
        const fallbackImages = await searchUnsplashImages(fallbackKeywords, 2, postContent);
        images.push(...fallbackImages.slice(0, imageCount - images.length));
      }
    } catch (error) {
      console.error('Fallback image search failed:', error);
    }
  }

  if (images.length > 0) {
    tracker.recordUsage('unsplash');
  }

  return { images: images.slice(0, imageCount), suggestions };
}

function extractFallbackKeywords(postContent: string): string[] {
  const fallbackKeywords = ['business', 'professional', 'technology'];
  
  const lowerContent = postContent.toLowerCase();
  
  if (lowerContent.includes('tech') || lowerContent.includes('code') || lowerContent.includes('software')) {
    fallbackKeywords.push('technology', 'computer', 'innovation');
  }
  
  if (lowerContent.includes('career') || lowerContent.includes('job') || lowerContent.includes('work')) {
    fallbackKeywords.push('career', 'growth', 'workplace');
  }
  
  if (lowerContent.includes('team') || lowerContent.includes('collaborate') || lowerContent.includes('meeting')) {
    fallbackKeywords.push('teamwork', 'collaboration', 'office');
  }
  
  return fallbackKeywords;
}

export interface PostWithImages {
  content: string;
  images: GeneratedImage[];
  imageSuggestions: ImageSuggestion[];
}

export async function generatePostWithImages(
  postContent: string,
  imageSource: 'unsplash' | 'pexels' | 'ai' = 'unsplash',
  imageCount: number = 1
): Promise<PostWithImages> {
  const { images, suggestions } = await getImagesForPost(postContent, imageSource, imageCount);
  
  return {
    content: postContent,
    images,
    imageSuggestions: suggestions,
  };
}

export function getImageUsageStats(): ImageUsageStats {
  const tracker = SimpleImageTracker.getInstance();
  return tracker.getStats();
}
