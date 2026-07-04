import { api } from '../lib/api';

/**
 * Request generation of study assistant content (quizzes, flashcards, summaries, etc.)
 * @param {Object} payload - { tool, topic, difficulty, question_count }
 */
export const generateStudyContent = async (payload) => {
  const token = localStorage.getItem('userToken');
  try {
    const response = await api.post('/api/study', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('[Study Service] Error generating study content:', error);
    throw error;
  }
};
