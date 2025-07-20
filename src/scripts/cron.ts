import Parser from 'rss-parser';
import prisma from '../lib/db';
import { RSS_FEEDS } from '../lib/rssFeeds';
import { 
  NewsItem, 
  groupNewsByTopic, 
  generateLinkedInPost, 
  filterRecentNews 
} from '../lib/ai';
import axios from 'axios';

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN!;
const LINKEDIN_PERSON_URN = process.env.LINKEDIN_PERSON_URN!;

async function runCronJob() {
  console.log('Cron job started at:', new Date().toISOString());
  
  try {
    const parser = new Parser();
    const allNewsItems: NewsItem[] = [];
    
    for (const feed of RSS_FEEDS) {
      try {
        console.log(`Fetching from ${feed.name}...`);
        const parsedFeed = await parser.parseURL(feed.url);
        
        const newsItems = parsedFeed.items.slice(0, 10).map(item => ({
          title: item.title || '',
          link: item.link || '',
          content: item.content || item.description || item['content:encoded'] || '',
          pubDate: item.pubDate || new Date().toISOString(),
          source: feed.name,
          category: feed.category
        }));
        
        allNewsItems.push(...newsItems);
      } catch (error) {
        console.error(`Error fetching ${feed.name}:`, error);
        continue;
      }
    }
    
    console.log(`Total news items fetched: ${allNewsItems.length}`);
    
    const recentNews = filterRecentNews(allNewsItems, 72);
    console.log(`Recent news items (last 3 days): ${recentNews.length}`);
    
    if (recentNews.length === 0) {
      console.log('No recent news to process');
      return;
    }

    const processedLinks = await prisma.processedLink.findMany({
      select: { link: true }
    });
    const processedLinkSet = new Set(processedLinks.map(p => p.link));

    const unprocessedNews = recentNews.filter(item => !processedLinkSet.has(item.link));
    console.log(`Found ${unprocessedNews.length} new, unprocessed news items.`);

    if (unprocessedNews.length < 2) {
      console.log('Not enough new content to form a topic group.');
      return;
    }
    
    const topicGroups = await groupNewsByTopic(unprocessedNews);
    console.log(`News grouped into ${topicGroups.size} topics`);

    const eligibleTopics = Array.from(topicGroups.entries()).filter(
      ([, newsItems]) => newsItems.length >= 2
    );

    if (eligibleTopics.length === 0) {
      console.log('No topic groups with enough news items to post.');
      return;
    }

    const [topic, newsItems] = eligibleTopics[Math.floor(Math.random() * eligibleTopics.length)];
    console.log(`Randomly selected topic to process: "${topic}" with ${newsItems.length} items.`);

    try {
      const analysis = await generateLinkedInPost(newsItems);
      console.log(`Generated post using ${analysis.promptUsed} style for topic "${topic}"`);
      console.log(`---\nLinkedIn Post Draft:\n${analysis.linkedinPost}\n---`);
      
      const postBody = {
        author: LINKEDIN_PERSON_URN,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: analysis.linkedinPost
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };
      
      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        postBody,
        {
          headers: {
            'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );
      
      console.log(`Posted to LinkedIn for topic "${topic}". Post ID: ${response.headers['x-restli-id']}`);
      
      const newLinksToMark = newsItems.map(item => ({ link: item.link }));
      
      if (newLinksToMark.length > 0) {
        await prisma.processedLink.createMany({
          data: newLinksToMark,
          skipDuplicates: true
        });
        console.log(`Marked ${newLinksToMark.length} new links as processed for topic "${topic}".`);
      }
      
      console.log(`Cron job finished. Processed topic: "${topic}".`);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error processing topic "${topic}":`, error.response?.data || error.message);
      } else {
        console.error(`Error processing topic "${topic}":`, error);
      }
    }
    
  } catch (error) {
    console.error('Cron job error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cron job
runCronJob(); 