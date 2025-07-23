import 'dotenv/config';
import Parser from 'rss-parser';
import { RSS_FEEDS } from '../lib/rssFeeds';

async function extractRSSImages() {
  const parser = new Parser();
  const feedsWithImages = RSS_FEEDS.filter(f => f.name === 'The Verge' || f.name === 'Dev.to');
  
  for (const feed of feedsWithImages) {
    console.log(`\n${feed.name}:`);
    
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      const items = parsedFeed.items.slice(0, 3);
      
      items.forEach((item, index) => {
        console.log(`\nArticle ${index + 1}: ${item.title?.substring(0, 60)}...`);
        
        const content = item.content || item.description || item['content:encoded'] || '';
        const imgMatches = content.match(/<img[^>]+src=["']([^"']+)["']/gi);
        
        if (imgMatches) {
          imgMatches.slice(0, 3).forEach((img: string, imgIndex: number) => {
            const src = img.match(/src=["']([^"']+)["']/i)?.[1];
            const alt = img.match(/alt=["']([^"']*)["']/i)?.[1] || 'No alt text';
            console.log(`  Image ${imgIndex + 1}:`);
            console.log(`    URL: ${src}`);
            console.log(`    Alt: ${alt}`);
          });
        }
      });
      
    } catch (error) {
      console.log(`  Error: ${error}`);
    }
  }
}

extractRSSImages();
