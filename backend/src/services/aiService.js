const axios = require('axios');

const AI_SERVICE_URL = 'http://localhost:8001';

class AIService {
  async getPrediction(profile) {
    try {
      const url = AI_SERVICE_URL + '/predict';
      const requestData = {
        profile: {
          cgpa: profile.cgpa || 0,
          coding: profile.coding_score || 0,
          internships: profile.internships_count || 0,
          attendance: profile.attendance_percentage || 0,
          projects: profile.projects_count || 0,
          communication: profile.communication_score || 0,
          branch: profile.branch || 'cse',
          selectedSkills: profile.skills || []
        }
      };
      const response = await axios.post(url, requestData);
      return response.data;
    } catch (error) {
      console.error('AI Service Error:', error.message);
      return { probability: 0, error: 'AI service unavailable' };
    }
  }

  async getSkillGap(company, selectedSkills) {
    try {
      const url = AI_SERVICE_URL + '/skill-gap';
      const response = await axios.post(url, {
        company: company,
        selectedSkills: selectedSkills
      });
      return response.data;
    } catch (error) {
      console.error('AI Service Error:', error.message);
      return { error: 'AI service unavailable' };
    }
  }

  async getResumeAnalysis(filename) {
    try {
      const url = AI_SERVICE_URL + '/resume';
      const response = await axios.post(url, {
        filename: filename
      });
      return response.data;
    } catch (error) {
      console.error('AI Service Error:', error.message);
      return { error: 'AI service unavailable' };
    }
  }

  async healthCheck() {
    try {
      const url = AI_SERVICE_URL + '/health';
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return { status: 'error', message: 'AI service not available' };
    }
  }
}

module.exports = new AIService();
