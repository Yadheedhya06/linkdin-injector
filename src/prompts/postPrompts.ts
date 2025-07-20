export interface PostPrompt {
  id: string;
  style: string;
  tone: 'professional' | 'conversational' | 'thought-leader' | 'analytical' | 'innovative';
  template: string;
}

export const POST_PROMPTS: PostPrompt[] = [
  // Professional & Analytical
  {
    id: 'professional-analyst',
    style: 'Industry Analyst',
    tone: 'professional',
    template: `As a seasoned tech industry analyst, synthesize the following developments into a cohesive LinkedIn post:

{context}

Create an analytical summary that:
- Identifies the overarching trend or pattern
- Provides data-driven insights
- Offers strategic implications for professionals
- Concludes with a forward-looking perspective
- Includes appropriate emojis where they add value (maximum 6 emojis total)
- Does NOT include hashtags

Keep it professional yet engaging, around 200-250 words.`
  },

  // Thought Leadership
  {
    id: 'thought-leader',
    style: 'Thought Leader',
    tone: 'thought-leader',
    template: `Drawing from years of experience in tech innovation, craft a thought-provoking LinkedIn post about:

{context}

Your post should:
- Challenge conventional thinking
- Connect disparate ideas into a unified narrative
- Pose a compelling question to the audience
- Share a unique perspective that adds value
- Use appropriate emojis sparingly where they enhance the message (maximum 6 emojis total)
- Avoid hashtags

Write with authority and vision, approximately 200-250 words.`
  },

  // Conversational Expert
  {
    id: 'conversational-expert',
    style: 'Conversational Expert',
    tone: 'conversational',
    template: `Hey LinkedIn fam! I've been diving deep into some fascinating tech developments:

{context}

Share this in a conversational yet insightful way that:
- Breaks down complex ideas simply
- Uses relatable analogies
- Includes a personal observation or experience
- Ends with an engaging question for the community
- Incorporates appropriate emojis to enhance readability (maximum 6 emojis total)
- Does not use hashtags

Keep it friendly and accessible, around 200-250 words.`
  },

  // Innovation Enthusiast
  {
    id: 'innovation-enthusiast',
    style: 'Innovation Enthusiast',
    tone: 'innovative',
    template: `🚀 The future is being written right now! Check out these game-changing developments:

{context}

Create an energetic post that:
- Highlights the innovative aspects
- Connects to broader transformation themes
- Uses dynamic language and appropriate emojis to convey excitement (maximum 6 emojis total)
- Inspires action or further exploration
- Avoids hashtags

Make it exciting and forward-thinking, 200-250 words.`
  },

  // Strategic Advisor
  {
    id: 'strategic-advisor',
    style: 'Strategic Advisor',
    tone: 'analytical',
    template: `From a strategic perspective, these recent developments deserve our attention:

{context}

Develop a strategic analysis that:
- Identifies key business implications
- Provides actionable insights
- Considers multiple stakeholder perspectives
- Offers concrete recommendations
- Uses emojis judiciously to highlight key points (maximum 6 emojis total)
- Does not include hashtags

Write with clarity and purpose, approximately 200-250 words.`
  },

  // Tech Storyteller
  {
    id: 'tech-storyteller',
    style: 'Tech Storyteller',
    tone: 'conversational',
    template: `Let me tell you about a fascinating pattern I've noticed in tech lately:

{context}

Craft a narrative that:
- Weaves the developments into a compelling story
- Uses vivid examples and scenarios
- Makes technical concepts relatable
- Leaves readers with something to ponder
- Includes appropriate emojis to enhance the storytelling (maximum 6 emojis total)
- Avoids hashtags

Tell it like a story, around 200-250 words.`
  },

  // Industry Connector
  {
    id: 'industry-connector',
    style: 'Industry Connector',
    tone: 'professional',
    template: `Connecting the dots across the tech landscape:

{context}

Create a synthesis that:
- Shows relationships between different developments
- Highlights cross-industry implications
- Identifies collaboration opportunities
- Encourages networking and discussion
- Uses emojis thoughtfully to emphasize connections (maximum 6 emojis total)
- Does not use hashtags

Be insightful and collaborative, 200-250 words.`
  },

  // Future Forecaster
  {
    id: 'future-forecaster',
    style: 'Future Forecaster',
    tone: 'innovative',
    template: `Looking ahead, these current developments paint an intriguing picture:

{context}

Develop a forward-looking post that:
- Extrapolates current trends
- Presents plausible future scenarios
- Discusses potential opportunities and challenges
- Invites readers to shape the future
- Incorporates appropriate emojis to visualize the future (maximum 6 emojis total)
- Avoids hashtags

Be visionary yet grounded, around 200-250 words.`
  }
];

// Helper function to get a random prompt
export function getRandomPrompt(): PostPrompt {
  const randomIndex = Math.floor(Math.random() * POST_PROMPTS.length);
  return POST_PROMPTS[randomIndex];
}

// Helper function to get prompts by tone
export function getPromptsByTone(tone: PostPrompt['tone']): PostPrompt[] {
  return POST_PROMPTS.filter(prompt => prompt.tone === tone);
} 