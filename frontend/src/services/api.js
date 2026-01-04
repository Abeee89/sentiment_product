/**
 * API Service for communicating with Flask backend
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sentimentAPI = {
  // Upload file and get predictions
  uploadFile: async (file, description = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Predict sentiment for text
  predictText: async (text) => {
    const response = await api.post('/predict', { text });
    return response.data;
  },

  // Retrain model
  retrainModel: async (includeNewData = true) => {
    const response = await api.post('/retrain', { include_new_data: includeNewData });
    return response.data;
  },

  // Get all datasets
  getDatasets: async () => {
    const response = await api.get('/datasets');
    return response.data;
  },

  // Get dataset details
  getDatasetDetails: async (datasetId) => {
    const response = await api.get(`/dataset/${datasetId}`);
    return response.data;
  },

  // Get model information
  getModelInfo: async () => {
    const response = await api.get('/model/info');
    return response.data;
  },

  // Get statistics
  getStatistics: async (datasetId = null) => {
    const params = datasetId ? { dataset_id: datasetId } : {};
    const response = await api.get('/statistics', { params });
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default sentimentAPI;

