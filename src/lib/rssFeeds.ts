export interface RSSFeed {
  url: string;
  name: string;
  category: 'tech' | 'ai' | 'startup' | 'cloud' | 'security' | 'development';
}

export const RSS_FEEDS: RSSFeed[] = [
  // Tech News
  {
    url: 'https://techcrunch.com/feed/',
    name: 'TechCrunch',
    category: 'tech'
  },
  {
    url: 'https://www.theverge.com/rss/index.xml',
    name: 'The Verge',
    category: 'tech'
  },
  {
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    name: 'Ars Technica',
    category: 'tech'
  },
  
  // AI & Machine Learning
  {
    url: 'https://www.marktechpost.com/feed/',
    name: 'MarkTechPost',
    category: 'ai'
  },
  {
    url: 'https://www.artificialintelligence-news.com/feed/',
    name: 'AI News',
    category: 'ai'
  },
  
  // Startup & Business
  {
    url: 'https://venturebeat.com/feed/',
    name: 'VentureBeat',
    category: 'startup'
  },
  {
    url: 'https://www.wired.com/feed/rss',
    name: 'Wired',
    category: 'tech'
  },
  
  // Cloud & Infrastructure
  {
    url: 'https://aws.amazon.com/blogs/aws/feed/',
    name: 'AWS Blog',
    category: 'cloud'
  },
  
  // Security
  {
    url: 'https://krebsonsecurity.com/feed/',
    name: 'Krebs on Security',
    category: 'security'
  },
  {
    url: 'https://www.darkreading.com/rss.xml',
    name: 'Dark Reading',
    category: 'security'
  },
  
  // Development
  {
    url: 'https://dev.to/feed',
    name: 'Dev.to',
    category: 'development'
  },
  {
    url: 'https://hackernoon.com/feed',
    name: 'HackerNoon',
    category: 'development'
  }
];

// Helper function to get feeds by category
export function getFeedsByCategory(category: string): RSSFeed[] {
  return RSS_FEEDS.filter(feed => feed.category === category);
}

// Helper function to get random feeds
export function getRandomFeeds(count: number): RSSFeed[] {
  const shuffled = [...RSS_FEEDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
} 