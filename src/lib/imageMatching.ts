import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { ImageSuggestion, GeneratedImage } from './imageGeneration';

const model = google('gemini-2.5-pro');

export interface ContentAnalysis {
  mainTopics: string[];
  sentiment: 'professional' | 'motivational' | 'educational' | 'technical' | 'industry';
  keyEntities: string[];
  visualConcepts: string[];
  industryContext: string;
  emotionalTone: 'inspiring' | 'informative' | 'analytical' | 'conversational';
}

export interface ImageRelevanceScore {
  image: GeneratedImage;
  relevanceScore: number;
  matchingFactors: string[];
  missingElements: string[];
}

export async function analyzePostContent(postContent: string): Promise<ContentAnalysis> {
  const { text } = await generateText({
    model,
    prompt: `Analyze this LinkedIn post and extract key information for image matching:

Post Content:
${postContent}

Extract and return ONLY a JSON object with this structure:
{
  "mainTopics": ["topic1", "topic2"],
  "sentiment": "professional|motivational|educational|technical|industry",
  "keyEntities": ["entity1", "entity2"],
  "visualConcepts": ["concept1", "concept2"],
  "industryContext": "brief industry description",
  "emotionalTone": "inspiring|informative|analytical|conversational"
}

Guidelines:
- mainTopics: 2-4 core subjects discussed
- sentiment: Overall professional category
- keyEntities: Specific companies, technologies, concepts mentioned
- visualConcepts: Objects, scenes, or metaphors that could be visualized
- industryContext: Industry or domain this relates to
- emotionalTone: The emotional approach of the content`,
    temperature: 0.3,
  });

  try {
    const cleanedText = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Failed to parse content analysis:', error);
    
    const fallbackAnalysis: ContentAnalysis = {
      mainTopics: extractTopicsFromText(postContent),
      sentiment: inferSentiment(postContent),
      keyEntities: extractEntities(postContent),
      visualConcepts: extractVisualConcepts(postContent),
      industryContext: 'Technology/Business',
      emotionalTone: 'informative'
    };
    
    return fallbackAnalysis;
  }
}

export async function generateEnhancedImageSuggestions(
  postContent: string,
  contentAnalysis: ContentAnalysis
): Promise<ImageSuggestion[]> {
  const { text } = await generateText({
    model,
    prompt: `Create image suggestions that perfectly match this LinkedIn post content.

Post Content:
${postContent}

Content Analysis:
- Main Topics: ${contentAnalysis.mainTopics.join(', ')}
- Sentiment: ${contentAnalysis.sentiment}
- Key Entities: ${contentAnalysis.keyEntities.join(', ')}
- Visual Concepts: ${contentAnalysis.visualConcepts.join(', ')}
- Industry: ${contentAnalysis.industryContext}
- Tone: ${contentAnalysis.emotionalTone}

Generate 5 image suggestions that directly relate to the content. Each suggestion should:
1. Use specific visual elements mentioned or implied in the post
2. Match the emotional tone and industry context
3. Include relevant metaphors or symbols
4. Be appropriate for LinkedIn's professional audience

Return ONLY a JSON object:
{
  "suggestions": [
    {
      "prompt": "very specific image description that directly relates to post content",
      "keywords": ["specific", "relevant", "keywords", "from", "content"],
      "style": "professional|tech|career|motivational|educational",
      "description": "detailed explanation of how this image perfectly matches the post content",
      "confidenceScore": 0.95,
      "visualElements": ["element1", "element2"],
      "conceptualMatch": "how this represents the main idea"
    }
  ]
}`,
    temperature: 0.4,
  });

  try {
    const cleanedText = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(cleanedText);
    return parsed.suggestions || [];
  } catch (error) {
    console.error('Failed to parse enhanced image suggestions:', error);
    return [];
  }
}

export async function scoreImageRelevance(
  images: GeneratedImage[],
  postContent: string,
  contentAnalysis: ContentAnalysis
): Promise<ImageRelevanceScore[]> {
  const scoredImages: ImageRelevanceScore[] = [];

  for (const image of images) {
    const { text } = await generateText({
      model,
      prompt: `Score how well this image matches the LinkedIn post content:

Post Content:
${postContent}

Content Analysis:
- Topics: ${contentAnalysis.mainTopics.join(', ')}
- Industry: ${contentAnalysis.industryContext}
- Visual Concepts: ${contentAnalysis.visualConcepts.join(', ')}

Image Details:
- Alt Text: ${image.alt}
- Source: ${image.source}

Rate the relevance from 0.0 to 1.0 and explain the match:

Return ONLY a JSON object:
{
  "relevanceScore": 0.85,
  "matchingFactors": ["factor1", "factor2"],
  "missingElements": ["missing1", "missing2"]
}`,
      temperature: 0.2,
    });

    try {
      const cleanedText = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const scoreData = JSON.parse(cleanedText);
      
      scoredImages.push({
        image,
        relevanceScore: scoreData.relevanceScore || 0.5,
        matchingFactors: scoreData.matchingFactors || [],
        missingElements: scoreData.missingElements || []
      });
    } catch (error) {
      console.error('Failed to score image relevance:', error);
      const fallbackScore = calculateFallbackScore(image, contentAnalysis);
      scoredImages.push({
        image,
        relevanceScore: fallbackScore,
        matchingFactors: ['Basic keyword matching'],
        missingElements: ['Detailed analysis failed']
      });
    }
  }

  return scoredImages.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function extractTopicsFromText(text: string): string[] {
  const techKeywords = ['AI', 'ML', 'React', 'JavaScript', 'Python', 'Node.js', 'cloud', 'data'];
  const careerKeywords = ['career', 'growth', 'leadership', 'team', 'management', 'skills'];
  const businessKeywords = ['startup', 'business', 'strategy', 'market', 'innovation'];
  
  const topics: string[] = [];
  const lowerText = text.toLowerCase();
  
  if (techKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
    topics.push('Technology');
  }
  if (careerKeywords.some(keyword => lowerText.includes(keyword))) {
    topics.push('Career Development');
  }
  if (businessKeywords.some(keyword => lowerText.includes(keyword))) {
    topics.push('Business');
  }
  
  return topics.length > 0 ? topics : ['Professional Development'];
}

function inferSentiment(text: string): ContentAnalysis['sentiment'] {
  const motivationalWords = ['inspire', 'achieve', 'success', 'growth', 'opportunity'];
  const technicalWords = ['code', 'development', 'programming', 'algorithm', 'system'];
  const educationalWords = ['learn', 'teach', 'guide', 'tutorial', 'tips'];
  
  const lowerText = text.toLowerCase();
  
  if (motivationalWords.some(word => lowerText.includes(word))) return 'motivational';
  if (technicalWords.some(word => lowerText.includes(word))) return 'technical';
  if (educationalWords.some(word => lowerText.includes(word))) return 'educational';
  
  return 'professional';
}

function extractEntities(text: string): string[] {
  const entities: string[] = [];
  const commonTechEntities = ['React', 'JavaScript', 'Python', 'AWS', 'Google', 'Microsoft', 'GitHub'];
  
  commonTechEntities.forEach(entity => {
    if (text.includes(entity)) {
      entities.push(entity);
    }
  });
  
  return entities;
}

function extractVisualConcepts(text: string): string[] {
  const visualKeywords = [
    'growth', 'chart', 'graph', 'network', 'connection', 'building', 'team',
    'laptop', 'screen', 'code', 'office', 'meeting', 'presentation', 'dashboard'
  ];
  
  const concepts: string[] = [];
  const lowerText = text.toLowerCase();
  
  visualKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      concepts.push(keyword);
    }
  });
  
  return concepts;
}

function calculateFallbackScore(image: GeneratedImage, analysis: ContentAnalysis): number {
  let score = 0.5;
  const altText = image.alt.toLowerCase();
  
  analysis.mainTopics.forEach(topic => {
    if (altText.includes(topic.toLowerCase())) {
      score += 0.2;
    }
  });
  
  analysis.visualConcepts.forEach(concept => {
    if (altText.includes(concept.toLowerCase())) {
      score += 0.1;
    }
  });
  
  return Math.min(score, 1.0);
}
