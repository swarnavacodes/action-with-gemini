// Simplified Gemini test with minimal token usage
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testSimpleGemini() {
    console.log('🧪 Testing Gemini API with minimal request...');
    
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY not found');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Try the most basic model first
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Very short prompt to minimize token usage
        const prompt = "Say 'OK' if you can read this.";
        
        console.log('📤 Sending minimal test request...');
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ SUCCESS! Gemini API is working');
        console.log(`📝 Response: "${text.trim()}"`);
        
        return { success: true, response: text };
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.message.includes('429') || error.message.includes('quota')) {
            console.log('\n💡 QUOTA ISSUE DETECTED:');
            console.log('- You have exceeded the free tier limits');
            console.log('- Wait 1 hour for quota to reset');
            console.log('- Or upgrade to paid plan for higher limits');
            console.log('- Free tier: 15 requests per minute, 1500 per day');
        } else if (error.message.includes('503') || error.message.includes('overloaded')) {
            console.log('\n💡 SERVICE OVERLOADED:');
            console.log('- Google servers are temporarily busy');
            console.log('- This is temporary - try again in 5-10 minutes');
            console.log('- Peak usage times may have more issues');
        }
        
        return { success: false, error: error.message };
    }
}

// Run test
testSimpleGemini().then(result => {
    if (result.success) {
        console.log('\n🎉 Ready to test PR review!');
    } else {
        console.log('\n⏳ Wait and try again later');
    }
});