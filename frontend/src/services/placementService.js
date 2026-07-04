import { api } from '../lib/api';

/**
 * Request generation of placement assistant content (resume reviews, mock interviews, roadmaps, company prep)
 * @param {Object} payload - { tool, action, question, answer, subject, resume_text, role, company }
 */
export const generatePlacementContent = async (payload) => {
  const token = localStorage.getItem('userToken');
  try {
    const response = await api.post('/api/placement', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('[Placement Service] Error generating placement content:', error);
    throw error;
  }
};
