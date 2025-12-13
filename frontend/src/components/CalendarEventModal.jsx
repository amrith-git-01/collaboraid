import React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Globe,
  X,
} from 'lucide-react';
import Button from './ui/Button';

const CalendarEventModal = ({ isOpen, onClose, event }) => {
  if (!isOpen || !event) return null;

  // Format date and time for display
  const formatDate = date => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = date => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Check if event spans multiple days
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isMultiDay = startDate.toDateString() !== endDate.toDateString();

  const handleBackdropClick = e => {
    // Close modal if clicking on the backdrop (not the modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Event Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4">
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {event.title}
                  </h3>
                  {event.isCreator && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-purple-100 text-purple-700">
                      Created
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {event.description}
                </p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    <span>
                      Starts: {formatDate(event.startDate)} at{' '}
                      {formatTime(event.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    <span>
                      Ends: {formatDate(event.endDate)} at{' '}
                      {formatTime(event.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {event.eventType === 'online' ? (
                      <Globe className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    )}
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    {event.attendees}/{event.maxAttendees} attendees
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    {event.eventAccessType === 'freeForAll'
                      ? 'Free'
                      : 'Invitation'}
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-medium rounded-full ml-2 flex-shrink-0 ${
                  event.status === 'upcoming'
                    ? 'bg-green-100 text-green-800'
                    : event.status === 'ongoing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {event.status}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            rounded="lg"
            onClick={onClose}
            className="text-sm"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarEventModal;
