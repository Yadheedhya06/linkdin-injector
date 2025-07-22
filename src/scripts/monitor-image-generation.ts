import 'dotenv/config';
import { 
  generateLinkedInFarmingPostWithImages,
  generateTechTipsPostWithImages 
} from '../lib/linkedinFarming';

async function monitorImageGeneration() {
  console.log('🔍 LinkedIn Image Generation Monitor');
  console.log('=====================================\n');
  console.log('📋 Environment Check:');
  console.log(`   ✅ Google AI API Key: ${process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'Present' : '❌ Missing'}`);
  console.log(`   ✅ Unsplash API Key: ${process.env.UNSPLASH_ACCESS_KEY ? 'Present' : '❌ Missing'}`);
  console.log(`   ✅ Pexels API Key: ${process.env.PEXELS_API_KEY ? 'Present' : '❌ Missing'}\n`);
  
  try {
    console.log('🧪 Test 1: Basic Post Generation with Images');
    console.log('-------------------------------------------');
    const startTime = Date.now();
    
    const post = await generateLinkedInFarmingPostWithImages('unsplash', 1);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`⏱️  Generation Time: ${duration.toFixed(2)} seconds`);
    console.log(`📝 Post Length: ${post.content.length} characters`);
    console.log(`🖼️  Images Found: ${post.images.length}`);
    console.log(`💡 AI Suggestions: ${post.imageSuggestions.length}`);
    
    if (post.images.length > 0) {
      console.log(`📸 First Image URL: ${post.images[0].url}`);
      console.log(`🏷️  Image Alt Text: ${post.images[0].alt}`);
      console.log(`📍 Image Source: ${post.images[0].source}`);
    }
    
    if (post.imageSuggestions.length > 0) {
      console.log(`🎨 First Suggestion Style: ${post.imageSuggestions[0].style}`);
      console.log(`🔍 Keywords Used: ${post.imageSuggestions[0].keywords.join(', ')}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('🧪 Test 2: Tech-Specific Post with Images');
    console.log('------------------------------------------');
    const techStartTime = Date.now();
    
    const techPost = await generateTechTipsPostWithImages('React', 'unsplash', 1);
    
    const techEndTime = Date.now();
    const techDuration = (techEndTime - techStartTime) / 1000;
    
    console.log(`⏱️  Generation Time: ${techDuration.toFixed(2)} seconds`);
    console.log(`📝 Post Length: ${techPost.content.length} characters`);
    console.log(`🖼️  Images Found: ${techPost.images.length}`);
    console.log(`💡 AI Suggestions: ${techPost.imageSuggestions.length}`);
    
    if (techPost.images.length > 0) {
      console.log(`📸 First Image URL: ${techPost.images[0].url}`);
      console.log(`🏷️  Image Alt Text: ${techPost.images[0].alt}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('📊 Performance Summary:');
    console.log('----------------------');
    console.log(`⏱️  Average Generation Time: ${((duration + techDuration) / 2).toFixed(2)} seconds`);
    console.log(`🖼️  Image Success Rate: ${((post.images.length + techPost.images.length) / 2 * 100).toFixed(0)}%`);
    console.log(`💡 AI Analysis Success Rate: ${((post.imageSuggestions.length + techPost.imageSuggestions.length) / 2 * 100).toFixed(0)}%`);
    
    console.log('\n✅ All systems operational!');
    
  } catch (error) {
    console.error('❌ Error during monitoring:', error);
    console.log('\n📋 Troubleshooting Checklist:');
    console.log('   1. Check API keys in .env file');
    console.log('   2. Verify internet connection');
    console.log('   3. Check API rate limits');
    console.log('   4. Verify package dependencies');
  }
}

if (require.main === module) {
  monitorImageGeneration();
}

export { monitorImageGeneration };
