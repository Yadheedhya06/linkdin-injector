import 'dotenv/config';
import { 
  generateLinkedInFarmingPost, 
  generateTechTipsPost, 
  generateCareerStoryPost, 
  generateEngagementPost,
  generateLinkedInFarmingPostWithImages,
  generateTechTipsPostWithImages,
  generateCareerStoryPostWithImages,
  generateEngagementPostWithImages
} from '../lib/linkedinFarming';

async function testFarmingPostsWithImages() {
  console.log('=== Testing LinkedIn Farming Posts WITH IMAGES ===\n');
  
  try {
    console.log('1. Generating random farming post with images...');
    const farmingPostWithImages = await generateLinkedInFarmingPostWithImages('unsplash', 1);
    console.log('✅ Farming Post:');
    console.log(farmingPostWithImages.content);
    console.log('\n📸 Images:');
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
      console.log(`     Prompt: ${suggestion.prompt}`);
      console.log(`     Description: ${suggestion.description}`);
    });
    console.log('\n' + '='.repeat(80) + '\n');
    
    console.log('2. Generating tech tips post with images...');
    const techPostWithImages = await generateTechTipsPostWithImages('React', 'unsplash', 1);
    console.log('✅ Tech Tips Post:');
    console.log(techPostWithImages.content);
    console.log('\n📸 Images:');
    techPostWithImages.images.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.url}`);
      console.log(`     Alt: ${img.alt}`);
      console.log(`     Source: ${img.source}`);
      if (img.attribution) console.log(`     Attribution: ${img.attribution}`);
    });
    console.log('\n' + '='.repeat(80) + '\n');
    
    console.log('3. Generating career story post with images...');
    const careerPostWithImages = await generateCareerStoryPostWithImages('unsplash', 1);
    console.log('✅ Career Story Post:');
    console.log(careerPostWithImages.content);
    console.log('\n📸 Images:');
    careerPostWithImages.images.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.url}`);
      console.log(`     Alt: ${img.alt}`);
      console.log(`     Source: ${img.source}`);
      if (img.attribution) console.log(`     Attribution: ${img.attribution}`);
    });
    console.log('\n' + '='.repeat(80) + '\n');
    
    console.log('4. Testing without images for comparison...');
    const plainPost = await generateEngagementPost();
    console.log('✅ Plain Engagement Post (no images):');
    console.log(plainPost);
    console.log('\n' + '='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Error testing farming posts with images:', error);
  }
}

async function testBasicPosts() {
  console.log('=== Testing Basic LinkedIn Farming Posts (No Images) ===\n');
  
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
    
  } catch (error) {
    console.error('❌ Error testing basic farming posts:', error);
  }
}

// Check if we want to test with images based on environment variables
const testWithImages = process.env.TEST_WITH_IMAGES === 'true' || process.argv.includes('--with-images');

if (testWithImages) {
  console.log('🖼️  Testing WITH images (requires API keys)...\n');
  testFarmingPostsWithImages();
} else {
  console.log('📝 Testing WITHOUT images (basic functionality)...\n');
  console.log('💡 To test with images, set TEST_WITH_IMAGES=true or use --with-images flag\n');
  testBasicPosts();
}
