# LinkedIn Content Injector

LinkedIn Content Injector is an automated system that fetches the latest news from various tech-focused RSS feeds, uses AI to group related articles into trending topics, generates insightful LinkedIn posts, and publishes them to your profile. It's designed to keep your LinkedIn presence active with relevant and engaging content, positioning you as a thought leader in the tech space.

## What is RSS?

RSS (Really Simple Syndication) is a web feed that allows users and applications to access updates to online content in a standardized, computer-readable format. These feeds syndicate web content such as blog posts, news headlines, and podcasts.

In this project, we use RSS feeds from various tech news websites to gather the latest articles and analysis.

## How it Works

The project follows a simple yet powerful workflow:

1.  **Fetch RSS Feeds**: A cron job runs periodically (e.g., daily) and fetches the latest articles from a predefined list of RSS feeds.

2.  **Filter and Group**: The system filters for recent and unprocessed news, then uses a Large Language Model (LLM) to group articles into semantically related topics. For example, articles about "GPT-4," "Large Language Models," and "AI in healthcare" might be grouped under a broader "AI Developments" topic.

3.  **Generate Post**: The system randomly selects one of the generated topics and uses another LLM call to generate a LinkedIn post. It uses a variety of prompt templates to create different styles of posts, such as "Industry Analyst," "Thought Leader," or "Conversational Expert." This ensures content variety and a natural-sounding voice.

4.  **Publish to LinkedIn**: The generated post is then automatically published to your LinkedIn profile using the LinkedIn API.

5.  **Track Processed Links**: To avoid duplicate content, the system keeps track of all the links that have been included in a post.

## Key Features

*   **Automated Content Creation**: Automatically generates and posts high-quality content to LinkedIn.
*   **AI-Powered Topic Grouping**: Uses AI to identify trending topics from a sea of news articles.
*   **Diverse Content Styles**: Leverages multiple prompt templates to create varied and engaging posts.
*   **Customizable RSS Feeds**: Easily customize the list of RSS feeds to match your interests.
*   **Extensible Prompt Library**: Add new prompts to create unique post styles and tones.
*   **Built with Next.js**: A modern, full-stack React framework for building fast and scalable applications.

## Technologies Used

*   **Next.js**: The core web framework.
*   **TypeScript**: For type-safe JavaScript.
*   **Prisma**: As the ORM for database interactions.
*   **PostgreSQL**: The database for storing processed links and posts.
*   **Google Gemini**: The AI model used for topic grouping and post generation.
*   **axios**: For making HTTP requests to the LinkedIn API.
*   **rss-parser**: For parsing RSS feeds.

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

*   Node.js (v20 or later)
*   pnpm
*   A PostgreSQL database
*   A LinkedIn account with API access

### Installation

1.  **Clone the repository**:

    ```bash
    git clone [https://github.com/your-username/linkedin-injector.git](https://github.com/Yadheedhya06/linkdin-injector.git)
    cd linkdin-injector
    ```

2.  **Install dependencies**:

    ```bash
    pnpm install
    ```

3.  **Set up environment variables**:

    Create a `.env.local` file in the root of the project and add the following variables:

    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    LINKEDIN_ACCESS_TOKEN="your-linkedin-access-token"
    LINKEDIN_PERSON_URN="your-linkedin-person-urn"
    GOOGLE_API_KEY="your-google-api-key"
    ```

    *   `DATABASE_URL`: Your PostgreSQL connection string.
    *   `LINKEDIN_ACCESS_TOKEN`: Your LinkedIn API access token.
    *   `LINKEDIN_PERSON_URN`: Your LinkedIn person URN (e.g., `urn:li:person:xxxxxxxx`).
    *   `GOOGLE_API_KEY`: Your Google API key for Gemini.

4.  **Set up the database**:

    ```bash
    npx prisma generate
    ```
    ```bash
    npx prisma db push
    ```

### Running the Project

1.  **Run the development server**:

    ```bash
    pnpm dev
    ```

2.  **Trigger the cron job manually**:

    To test the cron job, you can either run the script directly or send a GET request to the `/api/cron` endpoint.

    To run the script:

    ```bash
    pnpm cron
    ```

    To use the API endpoint, open your browser or use a tool like Postman to send a GET request to `http://localhost:3000/api/cron`.

## Project Structure

```
.
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── cron/
│   │       │   └── route.ts  # The main cron job logic
│   │       └── linkedin-callback/
│   │           └── route.ts  # LinkedIn API callback
│   ├── lib/
│   │   ├── ai.ts             # AI-related functions (grouping, post generation)
│   │   ├── db.ts             # Prisma client setup
│   │   └── rssFeeds.ts       # List of RSS feeds
│   └── prompts/
│       └── postPrompts.ts    # Prompt templates for post generation
└── package.json
```

## Customization

### Adding RSS Feeds

To add or change the RSS feeds, simply edit the `src/lib/rssFeeds.ts` file.

### Adding Post Prompts

You can add new post prompts by editing the `src/prompts/postPrompts.ts` file. Each prompt has a unique style and tone, allowing for a wide range of content possibilities.
