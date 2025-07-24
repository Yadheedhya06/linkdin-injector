import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { 
  CONTENT_TEMPLATES, 
  getRandomTemplate, 
  TECH_STACKS, 
  CAREER_TOPICS, 
  ContentTemplate,
  getTemplateById,
  getRandomTemplateByType,
  getRandomTemplateByCategory
} from './contentTypes';
import { 
  getImagesForPost, 
  GeneratedImage, 
  ImageSuggestion,
  PostWithImages 
} from './imageGeneration';

const model = google('gemini-2.5-pro');

function generatePromptFromTemplate(template: ContentTemplate): string {
  const techStack = getRandomItem(TECH_STACKS);
  const careerTopic = getRandomItem(CAREER_TOPICS);
  
  switch (template.id) {
    case 'career-mistake':
      return `Write a LinkedIn post about a career mistake you made early in your career and what you learned from it. Make it personal, relatable, and include a lesson that others can apply. Use first person narrative. Keep it authentic and conversational. Include relevant emojis. End with a question to engage readers.`;
    
    case 'tech-learning':
      return `Create a LinkedIn post giving advice on learning ${techStack}. Share practical tips, resources, and a learning path. Make it actionable and based on "experience". Write in first person as someone who has mastered this technology. Include emojis and end with an engaging question.`;
    
    case 'interview-lesson':
      return `Write about a challenging technical interview experience and the key lesson learned. Focus on ${careerTopic}. Make it a story with a clear takeaway. Use first person and make it relatable to job seekers. Include emojis and ask readers about their experiences.`;
    
    case 'skill-question':
      return `Pose a thought-provoking question about ${techStack} vs another technology choice. Frame it as seeking community input while subtly showing expertise. Include context about when each might be better. Use emojis and encourage discussion.`;
    
    case 'productivity-tips':
      return `Share 5 practical productivity tips for developers working with ${techStack}. Make each tip actionable with brief explanations. Write from experience and include specific examples. Use emojis for each point and ask what tips others would add.`;
    
    case 'motivation-post':
      return `Write an inspiring post about overcoming imposter syndrome in tech. Share a personal moment of doubt and how you overcame it. Make it motivational but authentic. Include advice for others facing similar challenges. Use emojis and end with encouragement.`;
    
    case 'leadership-story':
      return `Share a story about a time you had to make a difficult technical decision as a team lead. Focus on the decision-making process and lessons about leadership. Make it specific and include the outcome. Use first person and include takeaways for other leaders.`;
    
    case 'tech-trends':
      return `Give your take on where ${techStack} is heading in 2025. Share insights about emerging patterns, new features, or industry adoption. Position yourself as someone following the space closely. Include predictions and ask for others' thoughts.`;
    
    case 'coding-tips':
      return `Share 4 coding best practices when working with ${techStack}. Make each tip specific with brief code examples or scenarios. Write from experience and include common mistakes to avoid. Use emojis and ask what practices others follow.`;
    
    case 'career-growth':
      return `Write about a pivotal moment in your career when you transitioned from junior to senior developer. Focus on the mindset shift and key skills developed. Make it a story with actionable advice. Include specific examples and encourage others to share their growth moments.`;
    
    default:
      return generateGenericPrompt(template);
  }
}

function generateGenericPrompt(template: ContentTemplate): string {
  const techStack = getRandomItem(TECH_STACKS);
  const careerTopic = getRandomItem(CAREER_TOPICS);
  
  let basePrompt = '';
  
  switch (template.type) {
    case 'story':
      basePrompt = `Write a LinkedIn post sharing a personal story about ${template.category === 'tech' ? techStack : careerTopic}. Make it engaging with a clear beginning, challenge, and resolution.`;
      break;
    case 'advice':
      basePrompt = `Create a LinkedIn post giving practical advice about ${template.category === 'tech' ? techStack : careerTopic}. Share actionable insights based on experience.`;
      break;
    case 'lesson':
      basePrompt = `Write about an important lesson learned regarding ${template.category === 'tech' ? techStack : careerTopic}. Include the context and key takeaways.`;
      break;
    case 'question':
      basePrompt = `Pose a thoughtful question about ${template.category === 'tech' ? techStack : careerTopic} to engage your LinkedIn community.`;
      break;
    case 'list':
      basePrompt = `Share a numbered list of tips or best practices for ${template.category === 'tech' ? techStack : careerTopic}.`;
      break;
    case 'motivational':
      basePrompt = `Write an inspiring post about overcoming challenges in ${template.category === 'tech' ? 'technology' : template.category}.`;
      break;
    default:
      basePrompt = `Create a LinkedIn post about ${template.category === 'tech' ? techStack : careerTopic}.`;
  }
  
  return `${basePrompt} Use first person, include relevant emojis, and end with an engaging question. Keep it authentic and conversational.`;
}

export async function generateLinkedInFarmingPost(): Promise<string> {
  const template = getRandomTemplate();
  const prompt = generatePromptFromTemplate(template);
  const finalPrompt = prompt || generatePromptFromTemplate(
    CONTENT_TEMPLATES.find(t => t.id === 'career-mistake')!
  );
  
  const { text } = await generateText({
    model,
    prompt: `${finalPrompt}

Guidelines:
- Write 150-300 words
- Use casual, conversational tone
- Include 3-5 relevant emojis throughout
- End with an engaging question
- Make it feel authentic and personal
- Focus on providing value
- No hashtags
- Write as if you're an experienced developer sharing genuine insights`,
    temperature: 0.8,
  });

  return text;
}

export async function generateTechTipsPost(techStack?: string): Promise<string> {
  const stack = techStack || getRandomItem(TECH_STACKS);
  
  const techTemplate = getTemplateById('coding-tips') || 
                      getRandomTemplateByCategory('tech') ||
                      getRandomTemplateByType('list');
  
  if (techTemplate) {
    return generatePostFromTemplate(techTemplate);
  }
  
  const { text } = await generateText({
    model,
    prompt: `Create a LinkedIn post sharing 5 practical tips for working with ${stack}. Write as an experienced developer sharing hard-earned insights.

Structure:
- Brief intro about your experience with ${stack}
- 5 numbered tips with brief explanations
- Each tip should be actionable and specific
- Include common mistakes to avoid
- End with a question asking for additional tips

Guidelines:
- 200-350 words
- Conversational, helpful tone  
- Include relevant emojis
- Make it feel like genuine advice from experience
- No hashtags`,
    temperature: 0.7,
  });

  return text;
}

export async function generateCareerStoryPost(): Promise<string> {
  const careerTemplate = getTemplateById('career-growth') || 
                         getRandomTemplateByCategory('career') ||
                         getRandomTemplateByType('story');
  
  if (careerTemplate) {
    return generatePostFromTemplate(careerTemplate);
  }
  
  const topic = getRandomItem(CAREER_TOPICS);
  const { text } = await generateText({
    model,
    prompt: `Write a LinkedIn post sharing a personal career story about ${topic}. Make it a genuine, relatable experience that others can learn from.

Structure:
- Set the scene (when/where this happened)
- Describe the challenge or situation
- What you learned or how you grew
- Actionable advice for others
- Engaging question for readers

Guidelines:
- 180-280 words
- First person narrative
- Authentic and vulnerable tone
- Include specific details to make it believable
- 2-4 relevant emojis
- Focus on the lesson/growth
- No hashtags`,
    temperature: 0.8,
  });

  return text;
}

export async function generateEngagementPost(): Promise<string> {
  const questionTemplate = getTemplateById('skill-question') || 
                          getRandomTemplateByType('question');
  
  if (questionTemplate) {
    return generatePostFromTemplate(questionTemplate);
  }
  
  const topics = [
    'the most valuable skill in tech that schools don\'t teach',
    'the biggest mistake junior developers make',
    'the one piece of advice you\'d give to your younger developer self',
    'the most underrated programming language or framework',
    'the best way to stay updated with tech trends'
  ];
  
  const topic = getRandomItem(topics);
  const { text } = await generateText({
    model,
    prompt: `Create a LinkedIn post asking the community about ${topic}. Position yourself as someone genuinely curious while showing some expertise.

Structure:
- Brief personal context or observation
- Pose the main question clearly
- Share your own perspective briefly
- Encourage others to share their thoughts
- Maybe include a follow-up question

Guidelines:
- 120-200 words
- Curious, engaging tone
- Include 2-3 relevant emojis
- Make it feel like genuine community building
- End with clear call-to-action for responses
- No hashtags`,
    temperature: 0.8,
  });

  return text;
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export async function generatePostByType(
  type: ContentTemplate['type'], 
  category?: ContentTemplate['category']
): Promise<string> {
  let template: ContentTemplate | null = null;
  
  if (category) {
    const matchingTemplates = CONTENT_TEMPLATES.filter(t => 
      t.type === type && t.category === category
    );
    if (matchingTemplates.length > 0) {
      template = getRandomItem(matchingTemplates);
    }
  }
  
  if (!template) {
    template = getRandomTemplateByType(type);
  }
  
  if (!template) {
    return generateLinkedInFarmingPost();
  }
  
  return generatePostFromTemplate(template);
}

export async function generatePostByCategory(category: ContentTemplate['category']): Promise<string> {
  const template = getRandomTemplateByCategory(category);
  
  if (!template) {
    return generateLinkedInFarmingPost();
  }
  
  return generatePostFromTemplate(template);
}

async function generatePostFromTemplate(template: ContentTemplate): Promise<string> {
  const prompt = generatePromptFromTemplate(template);
  const guidelines = getGuidelinesForTemplate(template);
  
  const { text } = await generateText({
    model,
    prompt: `${prompt}\n\n${guidelines}`,
    temperature: getTemperatureForTemplate(template),
  });

  return text;
}

function getGuidelinesForTemplate(template: ContentTemplate): string {
  const baseGuidelines = `Guidelines:
- Use casual, conversational tone
- Include relevant emojis throughout
- End with an engaging question
- Make it feel authentic and personal
- Focus on providing value
- No hashtags
- Write as if you're an experienced developer sharing genuine insights`;

  switch (template.type) {
    case 'story':
      return `${baseGuidelines}
- Write 180-280 words
- Use first person narrative
- Include specific details to make it believable
- Focus on the lesson/growth`;
    
    case 'advice':
    case 'list':
      return `${baseGuidelines}
- Write 200-350 words
- Make content actionable and specific
- Include practical examples`;
    
    case 'question':
      return `${baseGuidelines}
- Write 120-200 words
- Make it feel like genuine community building
- End with clear call-to-action for responses`;
    
    case 'motivational':
      return `${baseGuidelines}
- Write 150-250 words
- Be inspiring but authentic
- Include advice for others facing similar challenges`;
    
    default:
      return `${baseGuidelines}
- Write 150-300 words`;
  }
}

function getTemperatureForTemplate(template: ContentTemplate): number {
  switch (template.type) {
    case 'story':
    case 'motivational':
      return 0.8;
    case 'advice':
    case 'list':
      return 0.7;
    case 'question':
      return 0.8;
    default:
      return 0.8;
  }
}

export async function generateLinkedInFarmingPostWithImages(
  imageSource: 'unsplash' | 'pexels' | 'ai' = 'unsplash',
  imageCount: number = 1
): Promise<PostWithImages> {
  const postContent = await generateLinkedInFarmingPost();
  const { images, suggestions } = await getImagesForPost(postContent, imageSource, imageCount);
  
  return {
    content: postContent,
    images,
    imageSuggestions: suggestions,
  };
}

export async function generateTechTipsPostWithImages(
  techStack?: string,
  imageSource: 'unsplash' | 'pexels' | 'ai' = 'unsplash',
  imageCount: number = 1
): Promise<PostWithImages> {
  const postContent = await generateTechTipsPost(techStack);
  const { images, suggestions } = await getImagesForPost(postContent, imageSource, imageCount);
  
  return {
    content: postContent,
    images,
    imageSuggestions: suggestions,
  };
}

export async function generateCareerStoryPostWithImages(
  imageSource: 'unsplash' | 'pexels' | 'ai' = 'unsplash',
  imageCount: number = 1
): Promise<PostWithImages> {
  const postContent = await generateCareerStoryPost();
  const { images, suggestions } = await getImagesForPost(postContent, imageSource, imageCount);
  
  return {
    content: postContent,
    images,
    imageSuggestions: suggestions,
  };
}

export async function generateEngagementPostWithImages(
  imageSource: 'unsplash' | 'pexels' | 'ai' = 'unsplash',
  imageCount: number = 1
): Promise<PostWithImages> {
  const postContent = await generateEngagementPost();
  const { images, suggestions } = await getImagesForPost(postContent, imageSource, imageCount);
  
  return {
    content: postContent,
    images,
    imageSuggestions: suggestions,
  };
}
