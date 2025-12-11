import { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

function RemovePhotoModal({ isOpen, onClose, onConfirm, currentPhoto }) {
  const [isRemoving, setIsRemoving] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsRemoving(true);
    try {
      await onConfirm();
      // Close modal after successful removal
      setTimeout(() => {
        onClose();
      }, 300); // Wait for any animations to complete
    } catch (error) {
      console.error('Error removing photo:', error);
      setIsRemoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Remove Profile Photo
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-gray-200">
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt="Current Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  U
                </div>
              )}
            </div>
            <p className="text-gray-700">
              Are you sure you want to remove your profile photo?
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isRemoving}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isRemoving}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isRemoving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Photo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RemovePhotoModal;
