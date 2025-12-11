import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';

const LeaveEventModal = ({ isOpen, onClose, onConfirm, eventName }) => {
  const [typedText, setTypedText] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTypedText('');
      setError('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (typedText.toLowerCase().trim() === 'leave') {
      onConfirm();
      onClose();
    } else {
      setError('Please type "leave" to confirm');
      setTypedText('');
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleClose = () => {
    setTypedText('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Leave Event
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Are you sure you want to leave this event?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-500 mb-1">Event:</p>
                <p className="font-medium text-gray-900">{eventName}</p>
              </div>
              <p className="text-gray-600 mb-4">
                Type <span className="font-semibold text-red-600">"leave"</span>{' '}
                to confirm:
              </p>

              {/* Input Field */}
              <input
                type="text"
                value={typedText}
                onChange={e => setTypedText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type 'leave' here"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                autoFocus
              />

              {/* Error Message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm mt-2"
                >
                  {error}
                </motion.p>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                rounded="lg"
                fullWidth
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                rounded="lg"
                fullWidth
                onClick={handleConfirm}
                disabled={typedText.toLowerCase().trim() !== 'leave'}
              >
                Leave Event
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LeaveEventModal;
