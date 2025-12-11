import { useState, useRef, useCallback } from 'react';
import {
  X,
  Upload,
  Image,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

function UploadModal({ isOpen, onClose, onUpload, currentPhoto }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const validateFile = file => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return 'Please select an image file (JPEG, PNG, or WebP)';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const handleDrag = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validationError = validateFile(droppedFile);

      if (validationError) {
        setError(validationError);
        setFile(null);
      } else {
        setError('');
        setFile(droppedFile);
      }
    }
  }, []);

  const handleFileSelect = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile);

      if (validationError) {
        setError(validationError);
        setFile(null);
      } else {
        setError('');
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onUpload(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Close modal after successful upload
      setTimeout(() => {
        onClose();
        setFile(null);
        setUploadProgress(0);
        setUploading(false);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      onClose();
      setFile(null);
      setError('');
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Upload Profile Photo
          </h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Photo Preview */}
          {currentPhoto && (
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600 mb-3">Current Photo</p>
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-gray-200">
                <img
                  src={currentPhoto}
                  alt="Current Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragActive
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                {file ? (
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                ) : (
                  <Image className="w-8 h-8 text-purple-600" />
                )}
              </div>

              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {file ? file.name : 'Drop your image here'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {file
                    ? 'File selected successfully!'
                    : 'or click to browse files'}
                </p>

                {!file && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 font-medium"
                  >
                    Browse Files
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-purple-600 font-medium">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* File Info */}
          {file && !uploading && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Image className="w-5 h-5 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 font-medium disabled:opacity-50 flex items-center space-x-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;
