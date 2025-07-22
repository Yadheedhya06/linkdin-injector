export interface ContentTemplate {
  id: string;
  type: 'story' | 'advice' | 'lesson' | 'question' | 'list' | 'motivational';
  category: 'career' | 'tech' | 'leadership' | 'learning' | 'productivity' | 'general';
  weight: number;
}

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  { id: 'career-mistake', type: 'story', category: 'career', weight: 8 },
  { id: 'tech-learning', type: 'advice', category: 'tech', weight: 10 },
  { id: 'interview-lesson', type: 'lesson', category: 'career', weight: 9 },
  { id: 'skill-question', type: 'question', category: 'learning', weight: 7 },
  { id: 'productivity-tips', type: 'list', category: 'productivity', weight: 8 },
  { id: 'motivation-post', type: 'motivational', category: 'general', weight: 6 },
  { id: 'leadership-story', type: 'story', category: 'leadership', weight: 7 },
  { id: 'tech-trends', type: 'advice', category: 'tech', weight: 9 },
  { id: 'coding-tips', type: 'list', category: 'tech', weight: 9 },
  { id: 'career-growth', type: 'lesson', category: 'career', weight: 8 }
];

export function getRandomTemplate(): ContentTemplate {
  const totalWeight = CONTENT_TEMPLATES.reduce((sum, template) => sum + template.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const template of CONTENT_TEMPLATES) {
    random -= template.weight;
    if (random <= 0) return template;
  }
  
  return CONTENT_TEMPLATES[0];
}

export const TECH_STACKS = [
  'React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 
  'Kubernetes', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'REST APIs',
  'Vue.js', 'Angular', 'Express.js', 'NestJS', 'Django', 'FastAPI',
  'MySQL', 'Git', 'Jenkins', 'CI/CD', 'Microservices', 'Serverless'
];

export const CAREER_TOPICS = [
  'switching careers', 'negotiating salary', 'remote work', 'team leadership',
  'code reviews', 'technical interviews', 'work-life balance', 'mentoring',
  'open source contributions', 'side projects', 'networking', 'burnout'
];

export function getTemplatesByType(type: ContentTemplate['type']): ContentTemplate[] {
  return CONTENT_TEMPLATES.filter(template => template.type === type);
}

export function getTemplatesByCategory(category: ContentTemplate['category']): ContentTemplate[] {
  return CONTENT_TEMPLATES.filter(template => template.category === category);
}

export function getTemplateById(id: string): ContentTemplate | undefined {
  return CONTENT_TEMPLATES.find(template => template.id === id);
}

export function getRandomTemplateByType(type: ContentTemplate['type']): ContentTemplate | null {
  const templates = getTemplatesByType(type);
  if (templates.length === 0) return null;
  
  const totalWeight = templates.reduce((sum, template) => sum + template.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const template of templates) {
    random -= template.weight;
    if (random <= 0) return template;
  }
  
  return templates[0];
}

export function getRandomTemplateByCategory(category: ContentTemplate['category']): ContentTemplate | null {
  const templates = getTemplatesByCategory(category);
  if (templates.length === 0) return null;
  
  const totalWeight = templates.reduce((sum, template) => sum + template.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const template of templates) {
    random -= template.weight;
    if (random <= 0) return template;
  }
  
  return templates[0];
}
