import 'dotenv/config';
import axios from 'axios';

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_PERSON_URN = process.env.LINKEDIN_PERSON_URN;

if (!LINKEDIN_ACCESS_TOKEN || !LINKEDIN_PERSON_URN) {
  console.error('Missing LinkedIn environment variables. Please ensure LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_URN are set.');
  process.exit(1);
}

const postToLinkedIn = async (text: string) => {
  const postBody = {
    author: LINKEDIN_PERSON_URN,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: text
        },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };

  try {
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
    console.log(`Successfully posted to LinkedIn. Post ID: ${response.headers['x-restli-id']}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
        console.error('Error posting to LinkedIn:', error.response?.data || error.message);
      } else {
        console.error('Error posting to LinkedIn:', error);
      }
    process.exit(1);
  }
};

const textToPost = process.argv[2];

if (!textToPost) {
  console.error('Please provide text to post as an argument.');
  console.log('Usage: pnpm test-linkedin-post "Your post text here"');
  process.exit(1);
}

postToLinkedIn(textToPost); 