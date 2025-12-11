import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import Button from './ui/Button';

const DeleteEventModal = ({
  isOpen,
  onClose,
  onConfirm,
  eventName,
  eventId,
}) => {
  const [typedName, setTypedName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTypedName('');
      setError('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (typedName.trim() === eventName) {
      onConfirm(eventId);
      onClose();
    } else {
      setError('Please type the exact event name to confirm deletion');
      setTypedName('');
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Delete Event
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This action cannot be undone. To confirm deletion, please type the
              exact event name:
            </p>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                Event name to delete:
              </p>
              <p className="font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg border">
                "{eventName}"
              </p>
            </div>

            <div className="mb-4">
              <label
                htmlFor="confirmName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Type the event name to confirm:
              </label>
              <input
                id="confirmName"
                type="text"
                value={typedName}
                onChange={e => setTypedName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter event name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              rounded="lg"
              fullWidth
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              rounded="lg"
              fullWidth
              onClick={handleConfirm}
              disabled={typedName.trim() !== eventName}
            >
              Delete Event
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteEventModal;
