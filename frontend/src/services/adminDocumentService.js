import { api } from '../lib/api';

/**
 * Fetch all documents
 */
export const getDocuments = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await api.get('/api/pdfs/', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};

/**
 * Upload a document with metadata
 * @param {File} file - PDF file object
 * @param {Object} metadata - { department, semester, academic_year, subject }
 * @param {Function} onUploadProgress - Axios progress callback
 */
export const uploadDocument = async (file, metadata = {}, onUploadProgress = null) => {
  const token = localStorage.getItem('adminToken');
  const formData = new FormData();
  formData.append('file', file);
  
  // Flat unpack metadata into formData for backend controller compatibility
  if (metadata.department) formData.append('department', metadata.department);
  if (metadata.semester) formData.append('semester', metadata.semester);
  if (metadata.academic_year) formData.append('academic_year', metadata.academic_year);
  if (metadata.subject) formData.append('subject', metadata.subject);

  const response = await api.post('/api/pdfs/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    onUploadProgress
  });
  return response.data ?? {};
};

/**
 * Delete a document by publicId
 * @param {string} publicId
 */
export const deleteDocument = async (publicId) => {
  const token = localStorage.getItem('adminToken');
  const response = await api.delete(`/api/pdfs/${publicId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};

/**
 * Rebuild the vector knowledge base (RAG embeddings)
 */
export const rebuildKnowledgeBase = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await api.post('/api/pdfs/rebuild-embeddings', {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data ?? {};
};
