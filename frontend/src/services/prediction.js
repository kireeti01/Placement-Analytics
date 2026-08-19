import api from './api';

export const predictPlacement = async (data) => {
  const response = await api.post('/predictions/placement', data);
  return response.data;
};

export const analyzeSkillGap = async (data) => {
  const response = await api.post('/predictions/skill-gap', data);
  return response.data;
};

export const analyzeResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await api.post('/predictions/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getCompanyRecommendations = async (studentId) => {
  const url = studentId ? `/predictions/companies/${studentId}` : '/predictions/companies';
  const response = await api.get(url);
  return response.data;
};

export const getAtRiskStudents = async (collegeId) => {
  const response = await api.get(`/predictions/at-risk/${collegeId}`);
  return response.data;
};

export const getTrendForecast = async (collegeId) => {
  const response = await api.get(`/predictions/forecast/${collegeId}`);
  return response.data;
};