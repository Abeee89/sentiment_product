import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { sentimentAPI } from '../services/api';
import './FileUpload.css';

const FileUpload = ({ onUploadSuccess, onUploadError }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 
                         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                         'text/tab-separated-values'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['csv', 'xlsx', 'xls', 'tsv'];
    
    if (!allowedExtensions.includes(fileExtension)) {
      onUploadError('Invalid file type. Please upload CSV, XLSX, or TSV files.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress (actual progress would come from backend)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await sentimentAPI.uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        onUploadSuccess(result);
      }, 500);

    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      const errorMessage = error.response?.data?.error || error.message || 'Upload failed';
      onUploadError(errorMessage);
    }
  }, [onUploadSuccess, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/tab-separated-values': ['.tsv']
    },
    multiple: false,
    disabled: uploading
  });

  return (
    <div className="file-upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="upload-progress">
            <div className="spinner"></div>
            <p>Uploading and processing... {uploadProgress}%</p>
          </div>
        ) : (
          <div className="dropzone-content">
            <div className="upload-icon">📁</div>
            <p className="dropzone-text">
              {isDragActive
                ? 'Drop the file here...'
                : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="dropzone-hint">
              Supports CSV, XLSX, TSV files (Max 50MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

