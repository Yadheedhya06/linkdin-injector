import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { PostPrompt, getRandomPrompt } from '../prompts/postPrompts';

export interface NewsItem {
  title: string;
  link: string;
  content: string;
  pubDate: string;
  source: string;
  category?: string;
  images?: string[];
}

export interface AnalysisResult {
  linkedinPost: string;
  topics: string[];
  promptUsed: string;
}

const model = google('gemini-2.5-pro');
const BATCH_SIZE = 25; 
const DELAY_MS = 2000; 

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Groups news items by similar topics using AI, processing in batches to avoid rate limits.
 */
export async function groupNewsByTopic(newsItems: NewsItem[]): Promise<Map<string, NewsItem[]>> {
  if (newsItems.length === 0) {
    return new Map();
  }

  console.log(`Starting topic grouping for ${newsItems.length} news items with a batch size of ${BATCH_SIZE}.`);
  const allTopicGroups = new Map<string, NewsItem[]>();

  for (let i = 0; i < newsItems.length; i += BATCH_SIZE) {
    const batch = newsItems.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    console.log(`Processing batch ${batchNumber}: items ${i} to ${i + batch.length - 1}`);

    const prompt = `
    Analyze the following news items and group them by similar topics or themes.
    Return a JSON object where keys are topic names and values are arrays of indices of related news items from THIS BATCH.
    
    News items (batch):
    ${batch.map((item, index) => `
      ${index}: ${item.title}
      ${item.content.substring(0, 200)}...
    `).join('\n\n')}
    
    Important: Use indices from the batch list provided (0 to ${batch.length - 1}).
    Return only valid JSON like: {"AI Innovation": [0, 2, 5], "Cloud Computing": [1, 3]}
  `;

  console.log(`[Batch ${batchNumber}] Prompting LLM for topic grouping.`);
    try {
      const { text } = await generateText({
        model,
        prompt,
        temperature: 0.3,
      });
      console.log(`[Batch ${batchNumber}] Raw LLM output for grouping:`, text);

      let cleanedText = text;
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        cleanedText = jsonMatch[1];
      } else {
        const jsonStart = cleanedText.indexOf('{');
        const jsonEnd = cleanedText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
        }
      }

      const grouping = JSON.parse(cleanedText);
      
      for (const [topic, indices] of Object.entries(grouping)) {
        if (Array.isArray(indices)) {
          const itemsInTopic = (indices as number[])
            .map((itemIndex) => batch[itemIndex])
            .filter(Boolean);

          if (itemsInTopic.length > 0) {
            const normalizedTopic = topic.trim();
            if (allTopicGroups.has(normalizedTopic)) {
              const existingItems = allTopicGroups.get(normalizedTopic)!;
              const existingLinks = new Set(existingItems.map(item => item.link));
              const newItems = itemsInTopic.filter(item => !existingLinks.has(item.link));
              if(newItems.length > 0) {
                console.log(`Adding ${newItems.length} new items to existing topic "${normalizedTopic}".`);
                existingItems.push(...newItems);
              }
            } else {
              console.log(`Creating new topic "${normalizedTopic}" with ${itemsInTopic.length} items.`);
              allTopicGroups.set(normalizedTopic, itemsInTopic);
            }
          }
        }
      }
    } catch (error) {
      console.error(`[Batch ${batchNumber}] Error processing or parsing topic grouping:`, error);
      const topicName = `General Tech News (Batch ${batchNumber})`;
      console.log(`Fallback: Grouping all ${batch.length} items from batch under "${topicName}"`);
      if (allTopicGroups.has(topicName)) {
        allTopicGroups.get(topicName)!.push(...batch);
      } else {
        allTopicGroups.set(topicName, batch);
      }
    }

    if (i + BATCH_SIZE < newsItems.length) {
      console.log(`Waiting for ${DELAY_MS / 1000} seconds before next batch to respect rate limits...`);
      await sleep(DELAY_MS);
    }
  }

  if (allTopicGroups.size > 1) {
    const topicNames = Array.from(allTopicGroups.keys());
    const mergePrompt = `
      You have the following topic names from different batches. Group similar topics together and suggest a single canonical name for each group.
      
      Topics:
      ${topicNames.map(t => `- ${t}`).join('\n')}
      
      Return only valid JSON like: {
        "canonicalTopics": {
          "AI Developments": ["AI Innovation", "AI in Business", "AI Startups"],
          "Cybersecurity": ["Cyber Threats", "Data Privacy"]
        }
      }
    `;

    console.log('Prompting LLM for topic merging.');
    try {
      const { text } = await generateText({
        model,
        prompt: mergePrompt,
        temperature: 0.3,
      });
      console.log('Raw LLM output for merging:', text);

      let cleanedMergeText = text;
      const mergeJsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (mergeJsonMatch && mergeJsonMatch[1]) {
        cleanedMergeText = mergeJsonMatch[1];
      } else {
        const jsonStart = cleanedMergeText.indexOf('{');
        const jsonEnd = cleanedMergeText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          cleanedMergeText = cleanedMergeText.substring(jsonStart, jsonEnd + 1);
        }
      }

      const mergeData = JSON.parse(cleanedMergeText);
      const canonicalTopics = mergeData.canonicalTopics;

      if (canonicalTopics) {
        const mergedGroups = new Map<string, NewsItem[]>();

        for (const [canonical, originals] of Object.entries(canonicalTopics)) {
          const mergedItems: NewsItem[] = [];
          const seenLinks = new Set<string>();

          for (const orig of originals as string[]) {
            const items = allTopicGroups.get(orig);
            if (items) {
              for (const item of items) {
                if (!seenLinks.has(item.link)) {
                  mergedItems.push(item);
                  seenLinks.add(item.link);
                }
              }
              allTopicGroups.delete(orig);
            }
          }

          if (mergedItems.length > 0) {
            mergedGroups.set(canonical, mergedItems);
          }
        }

        for (const [topic, items] of allTopicGroups) {
          mergedGroups.set(topic, items);
        }

        console.log(`Merged into ${mergedGroups.size} topics.`);
        return mergedGroups;
      }
    } catch (error) {
      console.error('Error during topic merging:', error);
    }
  }

  console.log(`Finished grouping ${newsItems.length} items into ${allTopicGroups.size} topics.`);
  return allTopicGroups;
}

/**
 * Shortens a post if it exceeds a specified character limit.
 */
async function shortenPostIfNeeded(postText: string): Promise<string> {
  if (postText.length <= 2800) {
    return postText;
  }

  console.log(`Post is too long (${postText.length} chars). Shortening to 1500-1800 characters...`);
  
  const shortenPrompt = `The following text is intended for a LinkedIn post but it's too long. Please concisely rewrite it to be between 1500 and 1800 characters. It is crucial that you preserve the original tone, key messages, and all existing newline formatting (for paragraphs and lists). Return only the edited text, with no extra explanations or markdown.

Original text:
---
${postText}
---`;

  try {
    const { text: shortenedText } = await generateText({
      model,
      prompt: shortenPrompt,
      temperature: 0.5,
    });

    console.log(`Post shortened from ${postText.length} to ${shortenedText.length} chars.`);

    let cleanedText = shortenedText.replace(/#\w+/g, '').trim();
    cleanedText = cleanedText
      .split('\n')
      .map((line: string) => line.trim())
      .join('\n');

    return cleanedText;
  } catch (error) {
    console.error('Error shortening the post:', error);
    return postText;
  }
}


/**
 * Generates an analytical LinkedIn post from grouped news items
 */
export async function generateLinkedInPost(
  newsItems: NewsItem[],
  promptOverride?: PostPrompt
): Promise<AnalysisResult> {
  const selectedPrompt = promptOverride || getRandomPrompt();
  
  const context = newsItems.map(item => `
    Title: ${item.title}
    Source: ${item.source}
    Summary: ${item.content}
    Link: ${item.link}
  `).join('\n\n---\n\n');

  const finalPrompt = `
    ${selectedPrompt.template.replace('{context}', context)}
    
    ---
    IMPORTANT: Generate the LinkedIn post as plain text only. Do not use any Markdown formatting, such as ** for bold, * for italic, # for headings, or any other special characters for styling. Use all caps or rephrase for emphasis if needed, but keep it simple and readable as unformatted text.
    
    Based on the post you just generated, extract 3-5 main topics or themes.
    Return a single JSON object with two keys:
    1. "linkedinPost": The LinkedIn post text.
    2. "topics": An array of topic strings.
    
    Example JSON output:
    {
      "linkedinPost": "...",
      "topics": ["AI in Healthcare", "Machine Learning", "Tech Regulation"]
    }
  `;

  console.log('Generating post and topics');

  const { text } = await generateText({
    model,
    prompt: finalPrompt,
    temperature: 0.7,
  });

  console.log('LLM raw output:', text);

  try {
    let cleanedText = text;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      cleanedText = jsonMatch[1];
    } else {
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
      }
    }
    const result = JSON.parse(cleanedText);
    
    let postText = result.linkedinPost || '';
    postText = postText.replace(/#\w+/g, '').trim();
    postText = postText.replace(/\*\*/g, '');
    postText = postText
      .split('\n')
      .map((line: string) => line.trim())
      .join('\n');
    
    postText = await shortenPostIfNeeded(postText);
    
    return {
      linkedinPost: postText,
      topics: result.topics || ['Technology', 'Innovation'],
      promptUsed: selectedPrompt.style,
    };
  } catch (error) {
    console.error('Error parsing LinkedIn post and topics JSON:', error);
    
    let fallbackText = text;
    fallbackText = fallbackText.replace(/#\w+/g, '').trim();
    fallbackText = fallbackText.replace(/\*\*/g, '');
    fallbackText = fallbackText
      .split('\n')
      .map((line: string) => line.trim())
      .join('\n');
    
    fallbackText = await shortenPostIfNeeded(fallbackText);

    return {
      linkedinPost: fallbackText,
      topics: ['Technology', 'Innovation'],
      promptUsed: selectedPrompt.style,
    };
  }
}

/**
 * Filters news items for freshness and relevance
 */
export function filterRecentNews(newsItems: NewsItem[], hoursAgo: number = 72): NewsItem[] {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hoursAgo);
  
  return newsItems.filter(item => {
    const pubDate = new Date(item.pubDate);
    return pubDate > cutoffTime;
  });
} 