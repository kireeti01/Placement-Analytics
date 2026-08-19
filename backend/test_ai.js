const aiService = require('./src/services/aiService');

async function testAI() {
  console.log('Testing AI Service...');
  
  // Health check
  const health = await aiService.healthCheck();
  console.log('Health Check:', health);
  
  // Test prediction
  const profile = {
    cgpa: 9.1,
    coding_score: 780,
    internships_count: 2,
    attendance_percentage: 91,
    projects_count: 4,
    communication_score: 82,
    branch: 'cse',
    skills: ['python', 'sql', 'react']
  };
  
  const prediction = await aiService.getPrediction(profile);
  console.log('Prediction:', prediction);
}

testAI().catch(console.error);
