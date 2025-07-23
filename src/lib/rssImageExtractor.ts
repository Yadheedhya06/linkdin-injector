import Parser from 'rss-parser';
import { RSS_FEEDS, getRandomFeeds } from './rssFeeds';

export interface RSSImage {
  url: string;
  alt: string;
  source: 'rss';
  feedName: string;
  articleTitle?: string;
  articleUrl?: string;
}

export function extractImagesFromContent(content: string): string[] {
  const images: string[] = [];
  const imgMatches = content.match(/<img[^>]+src=["']([^"']+)["']/gi);
  
  if (imgMatches) {
    imgMatches.forEach(img => {
      const src = img.match(/src=["']([^"']+)["']/i)?.[1];
      if (src && !images.includes(src)) {
        images.push(src);
      }
    });
  }
  
  const directUrls = content.match(/https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|gif|webp)/gi);
  if (directUrls) {
    directUrls.forEach(url => {
      if (!images.includes(url)) {
        images.push(url);
      }
    });
  }
  
  return images;
}

export async function getImagesFromRSSFeeds(count: number = 1): Promise<RSSImage[]> {
  const parser = new Parser();
  const images: RSSImage[] = [];
  const feedsWithImages = getRandomFeeds(5);
  
  for (const feed of feedsWithImages) {
    if (images.length >= count) break;
    
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      const items = parsedFeed.items.slice(0, 3);
      
      for (const item of items) {
        if (images.length >= count) break;
        
        const content = item.content || item.description || item['content:encoded'] || '';
        const imageUrls = extractImagesFromContent(content);
        
        if (imageUrls.length > 0) {
          const imageUrl = imageUrls[0];
          const imgMatch = content.match(new RegExp(`<img[^>]+src=["']${imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i'));
          const alt = imgMatch?.[0]?.match(/alt=["']([^"']*)["']/i)?.[1] || `Image from ${item.title}`;
          
          images.push({
            url: imageUrl,
            alt: alt,
            source: 'rss',
            feedName: feed.name,
            articleTitle: item.title,
            articleUrl: item.link
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching images from ${feed.name}:`, error);
    }
  }
  
  return images;
}
