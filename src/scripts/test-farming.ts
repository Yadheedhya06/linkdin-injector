import 'dotenv/config';
import { 
  generateLinkedInFarmingPost, 
  generateTechTipsPost, 
  generateCareerStoryPost, 
  generateEngagementPost,
  generateLinkedInFarmingPostWithImages,
} from '../lib/linkedinFarming';

async function testFarmingPosts() {
  console.log('=== Testing LinkedIn Farming Posts ===\n');
  
  try {
    console.log('1. Generating random farming post...');
    const farmingPost = await generateLinkedInFarmingPost();
    console.log('✅ Farming Post:');
    console.log(farmingPost);
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('2. Generating tech tips post...');
    const techPost = await generateTechTipsPost('React');
    console.log('✅ Tech Tips Post:');
    console.log(techPost);
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('3. Generating career story post...');
    const careerPost = await generateCareerStoryPost();
    console.log('✅ Career Story Post:');
    console.log(careerPost);
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('4. Generating engagement post...');
    const engagementPost = await generateEngagementPost();
    console.log('✅ Engagement Post:');
    console.log(engagementPost);
    console.log('\n' + '='.repeat(50) + '\n');
    const hasUnsplashKey = !!process.env.UNSPLASH_ACCESS_KEY;
    const hasPexelsKey = !!process.env.PEXELS_API_KEY;
    
    if (hasUnsplashKey || hasPexelsKey) {
      console.log('🖼️  Image generation is available! Testing with images...\n');
      
      console.log('5. Generating farming post with images...');
      const imageSource = hasUnsplashKey ? 'unsplash' : 'pexels';
      const farmingPostWithImages = await generateLinkedInFarmingPostWithImages(imageSource, 1);
      
      console.log('✅ Farming Post with Images:');
      console.log(farmingPostWithImages.content);
      console.log('\n📸 Generated Images:');
      farmingPostWithImages.images.forEach((img, index) => {
        console.log(`  ${index + 1}. ${img.url}`);
        console.log(`     Alt: ${img.alt}`);
        console.log(`     Source: ${img.source}`);
        if (img.attribution) console.log(`     Attribution: ${img.attribution}`);
      });
      console.log('\n💡 AI Image Suggestions:');
      farmingPostWithImages.imageSuggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. Style: ${suggestion.style}`);
        console.log(`     Keywords: ${suggestion.keywords.join(', ')}`);
        console.log(`     Description: ${suggestion.description}`);
      });
      console.log('\n' + '='.repeat(50) + '\n');
    } else {
      console.log('💡 Image generation is available but requires API keys.');
      console.log('   Add UNSPLASH_ACCESS_KEY or PEXELS_API_KEY to your .env file');
      console.log('   See IMAGE_GENERATION.md for setup instructions\n');
    }
    
  } catch (error) {
    console.error('❌ Error testing farming posts:', error);
  }
}

testFarmingPosts();
