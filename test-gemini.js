// Simple test script to verify Gemini API is working
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiAPI() {
    console.log('🧪 Testing Gemini API connection...');
    
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY not found in environment variables');
        console.log('💡 Create a .env file with your API key:');
        console.log('GEMINI_API_KEY=your_api_key_here');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Test different model names to find what works
        const modelsToTest = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro',
            'models/gemini-1.5-flash',
            'models/gemini-1.5-pro'
        ];

        for (const modelName of modelsToTest) {
            console.log(`\n🔍 Testing model: ${modelName}`);
            
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                
                const prompt = "Hello! Please respond with 'API test successful' if you can read this.";
                
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                
                console.log(`✅ SUCCESS with ${modelName}`);
                console.log(`📝 Response: ${text.substring(0, 100)}...`);
                
                // If we get here, this model works
                return { success: true, workingModel: modelName, response: text };
                
            } catch (error) {
                console.log(`❌ FAILED with ${modelName}: ${error.message}`);
                
                // Check for specific error types
                if (error.message.includes('503')) {
                    console.log('   → Service overloaded, trying next model...');
                } else if (error.message.includes('404')) {
                    console.log('   → Model not found, trying next model...');
                } else if (error.message.includes('429')) {
                    console.log('   → Rate limited, waiting 5 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                } else {
                    console.log(`   → Unknown error: ${error.message}`);
                }
            }
        }
        
        console.log('\n❌ All models failed. Possible issues:');
        console.log('1. API key is invalid or expired');
        console.log('2. All models are temporarily overloaded');
        console.log('3. Network connectivity issues');
        console.log('4. API quota exceeded');
        
        return { success: false };
        
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        return { success: false, error: error.message };
    }
}

// Run the test
if (require.main === module) {
    testGeminiAPI().then(result => {
        if (result.success) {
            console.log('\n🎉 Gemini API is working! You can proceed with the PR review.');
            console.log(`✅ Working model: ${result.workingModel}`);
        } else {
            console.log('\n💥 Gemini API test failed. Please check your setup.');
            process.exit(1);
        }
    }).catch(error => {
        console.error('💥 Test script error:', error);
        process.exit(1);
    });
}

module.exports = testGeminiAPI;