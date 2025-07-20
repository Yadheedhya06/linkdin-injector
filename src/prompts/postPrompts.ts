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
    template: `As a seasoned tech industry analyst, synthesize the following developments into a comprehensive LinkedIn post:

{context}

Create an in-depth analytical summary that:
- Identifies the overarching trend or pattern with detailed explanation
- Provides extensive data-driven insights and real-world implications
- Offers strategic implications for professionals across different roles and industries
- Explores potential challenges and opportunities in detail
- Concludes with a forward-looking perspective and actionable takeaways
- Includes appropriate emojis throughout to enhance readability and engagement
- Uses clear, plain English that anyone can understand
- Breaks down complex concepts into digestible insights
- Does NOT include hashtags

Write comprehensively and engagingly, focusing on providing maximum value to readers through thorough analysis.`
  },

  // Thought Leadership
  {
    id: 'thought-leader',
    style: 'Thought Leader',
    tone: 'thought-leader',
    template: `Drawing from years of experience in tech innovation, craft a thought-provoking LinkedIn post about:

{context}

Your post should:
- Challenge conventional thinking with well-reasoned arguments
- Connect disparate ideas into a unified narrative with clear transitions
- Explore the deeper implications and second-order effects
- Pose compelling questions that spark meaningful discussions
- Share unique perspectives backed by concrete examples
- Provide comprehensive analysis that demonstrates deep understanding
- Use appropriate emojis strategically to emphasize key points
- Write in clear, accessible language that engages both experts and newcomers
- Avoid hashtags

Write with authority and vision, providing as much valuable insight as needed to fully explore the topic.`
  },

  // Conversational Expert
  {
    id: 'conversational-expert',
    style: 'Conversational Expert',
    tone: 'conversational',
    template: `Hey LinkedIn fam! I've been diving deep into some fascinating tech developments:

{context}

Share this in a conversational yet deeply insightful way that:
- Breaks down complex ideas into simple, relatable concepts
- Uses multiple analogies and real-world examples
- Includes personal observations, experiences, and lessons learned
- Explores different perspectives and considerations
- Addresses potential questions readers might have
- Ends with engaging questions that invite community discussion
- Incorporates emojis naturally throughout to enhance readability
- Uses everyday language while maintaining professional credibility
- Does not use hashtags

Keep it friendly and accessible while providing comprehensive insights that add real value.`
  },

  // Innovation Enthusiast
  {
    id: 'innovation-enthusiast',
    style: 'Innovation Enthusiast',
    tone: 'innovative',
    template: `🚀 The future is being written right now! Check out these game-changing developments:

{context}

Create an energetic and comprehensive post that:
- Highlights innovative aspects with detailed explanations
- Explores the transformative potential across multiple industries
- Discusses the technology's evolution and future possibilities
- Shares concrete examples of real-world applications
- Analyzes both immediate and long-term impacts
- Uses dynamic language and emojis to convey excitement and key insights
- Inspires action with specific suggestions and opportunities
- Maintains enthusiasm while providing substantive analysis
- Avoids hashtags

Make it exciting, forward-thinking, and packed with valuable insights.`
  },

  // Strategic Advisor
  {
    id: 'strategic-advisor',
    style: 'Strategic Advisor',
    tone: 'analytical',
    template: `From a strategic perspective, these recent developments deserve our detailed attention:

{context}

Develop a comprehensive strategic analysis that:
- Identifies key business implications across multiple dimensions
- Provides in-depth actionable insights with implementation considerations
- Considers perspectives from various stakeholders (customers, employees, investors, society)
- Offers concrete recommendations with rationale and expected outcomes
- Analyzes risks, opportunities, and trade-offs
- Discusses timing and market readiness factors
- Uses emojis strategically to highlight critical points and improve readability
- Employs clear, professional language accessible to diverse audiences
- Does not include hashtags

Write with clarity and purpose, providing thorough strategic guidance that readers can apply.`
  },

  // Tech Storyteller
  {
    id: 'tech-storyteller',
    style: 'Tech Storyteller',
    tone: 'conversational',
    template: `Let me tell you about a fascinating pattern I've noticed in tech lately:

{context}

Craft a rich narrative that:
- Weaves developments into a compelling, detailed story
- Uses vivid examples, scenarios, and case studies
- Makes technical concepts relatable through everyday comparisons
- Explores the human element and societal impact
- Builds tension and resolution like a good story
- Includes character perspectives (users, developers, business leaders)
- Uses emojis to enhance emotional connection and highlight key moments
- Maintains narrative flow while delivering substantive insights
- Avoids hashtags

Tell a complete story that educates, engages, and leaves readers with valuable takeaways.`
  },

  // Industry Connector
  {
    id: 'industry-connector',
    style: 'Industry Connector',
    tone: 'professional',
    template: `Connecting the dots across the tech landscape:

{context}

Create a comprehensive synthesis that:
- Shows detailed relationships between different developments
- Explores cross-industry implications with specific examples
- Identifies collaboration opportunities and potential partnerships
- Discusses ecosystem effects and network dynamics
- Analyzes convergence trends and their significance
- Provides insights on how professionals can leverage these connections
- Uses emojis thoughtfully to visualize connections and emphasize relationships
- Encourages networking with specific discussion points
- Does not use hashtags

Be thoroughly insightful and collaborative, helping readers see the bigger picture and their place in it.`
  },

  // Future Forecaster
  {
    id: 'future-forecaster',
    style: 'Future Forecaster',
    tone: 'innovative',
    template: `Looking ahead, these current developments paint an intriguing and complex picture:

{context}

Develop a comprehensive forward-looking post that:
- Extrapolates current trends with detailed reasoning
- Presents multiple plausible future scenarios with timelines
- Discusses potential opportunities, challenges, and unintended consequences
- Explores societal, economic, and technological implications
- Considers different adoption curves and market dynamics
- Addresses potential disruptions and paradigm shifts
- Invites readers to actively shape the future with specific actions
- Uses emojis to visualize future concepts and highlight key predictions
- Maintains balance between optimism and realism
- Avoids hashtags

Be visionary yet grounded, providing readers with a thorough understanding of what's coming and how to prepare.`
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